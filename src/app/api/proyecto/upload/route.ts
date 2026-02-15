import { NextResponse } from "next/server";
import { createClient } from "@/app/backend/utils/supabase/server";

export async function POST(req: Request) {
  try {
    
    console.log("[UPLOAD] Request received");
    const supabase = await createClient();

    // 1️⃣ Leer FormData
    const formData = await req.formData();

    const titulo = formData.get("titulo") as string;
    const descripcion = formData.get("descripcion") as string;
    const visibilidad = formData.get("visibilidad") as "public" | "private";
    const idCurso = Number(formData.get("id_curso"));
    const file = formData.get("file") as File | null;
    const uid = formData.get("uid");

    const idUsuario = Number(uid);
    
    if (Number.isNaN(idUsuario)) {
    return NextResponse.json(
        { error: "ID de usuario inválido" },
        { status: 400 }
    );
    }

    if (!titulo || !idCurso || !file) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios" },
        { status: 400 }
      );
    }

    // 2️⃣ Crear proyecto (RPC)
    const { data: idProyecto, error: createError } = await supabase.rpc(
        "crear_proyecto",
        {
            p_titulo: titulo,
            p_descripcion: descripcion,
            p_id_curso: idCurso,
            p_visibilidad: visibilidad,
            p_id_usuario: idUsuario,
        }
    );

    if (createError || !idProyecto) {
      console.error(createError);
      return NextResponse.json(
        { error: "Error creando el proyecto" },
        { status: 500 }
      );
    }

    // 3️⃣ Subir imagen a Storage
    const extension = file.name.split(".").pop();
    const filePath = `${idProyecto}/portada.${extension}`;
    
    const { error: uploadError } = await supabase.storage
      .from("proyectos")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error(uploadError);
      return NextResponse.json(
        { error: "Error subiendo la imagen" },
        { status: 500 }
      );
    }

    // 4️⃣ Obtener URL pública
    const { data: publicUrl } = supabase.storage
      .from("proyectos")
      .getPublicUrl(filePath);

    // 5️⃣ Asignar imagen al proyecto (RPC)
    const { error: updateError } = await supabase.rpc(
      "asignar_imagen_proyecto",
      {
        p_id_proyecto: idProyecto,
        p_imagen: publicUrl.publicUrl,
      }
    );

    if (updateError) {
      console.error(updateError);
      return NextResponse.json(
        { error: "Error asignando la imagen" },
        { status: 500 }
      );
    }

    // ✅ OK
    return NextResponse.json({ id_proyecto: idProyecto });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
