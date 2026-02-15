// file-upload-03.tsx
"use client";

// ✅ CHANGE: renombramos el icono a FileIcon para evitar conflicto con el tipo global File.
import { File as FileIcon, Trash } from "lucide-react";
import React from "react";
import { useDropzone } from "react-dropzone";

// ✅ CHANGE: usar el Textarea correcto de shadcn por alias absoluto (evita rutas raras como "./ui/textarea")
import { Textarea } from "@/app/frontend/components/ui/textarea";

import { Button } from "@/app/frontend/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/frontend/components/ui/card";
import { Input } from "@/app/frontend/components/ui/input";
import { Label } from "@/app/frontend/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/frontend/components/ui/select";
import { Separator } from "@/app/frontend/components/ui/separator";
import { cn } from "@/lib/utils";

// ✅ CHANGE: props opcionales para que el componente pueda cerrar el modal/avisar al padre sin acoplarse.
type FileUpload03Props = {
  cursos: Curso[];
  uid: string | null;
  onCancel?: () => void;
  onUploaded?: () => void;
};

type Curso = {
  id_curso: number;
  nombre: string;
  grado: number | null;
};

const MAX_FILE_SIZE = 50 * 1024 * 1024;


function formatBytes(bytes: number) {
  // ✅ CHANGE: helper para mostrar tamaño humano
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit++;
  }
  return `${size.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`;
}

export default function FileUpload03({
  cursos,
  uid,
  onCancel,
  onUploaded,
}: FileUpload03Props) {
  const [files, setFiles] = React.useState<File[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [cursoId, setCursoId] = React.useState<string>("");
  const [titulo, setTitulo] = React.useState("");
  const [descripcion, setDescripcion] = React.useState("");
  const [visibilidad, setVisibilidad] = React.useState<"public" | "private">("private");
  const [subiendo, setSubiendo] = React.useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    // ✅ CHANGE: acepta múltiples archivos
    multiple: true,
    maxSize: MAX_FILE_SIZE,
    accept: {
      "image/*": []
    },
    onDrop: (acceptedFiles) => {
      setError(null);
      setFiles(acceptedFiles);
    },
    onDropRejected: (rejections) => {
      // ✅ CHANGE: feedback si exceden tamaño u otras restricciones
      const first = rejections[0];
      if (!first) return;
      const reason = first.errors?.[0]?.code;
      if (reason === "file-too-large") {
        setError("Un archivo supera el tamaño máximo de 50MB.");
      } else {
        setError(
          "No se pudo cargar uno o más archivos. Revisa el formato/tamaño."
        );
      }
    },
  });
  
  const handleSubmit = async () => {
    if (!titulo || !cursoId || files.length === 0) {
      setError("Faltan datos obligatorios");
      return;
    }

    if (!uid) {
      setError("Usuario no identificado");
      return;
    }

    setSubiendo(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("titulo", titulo);
      formData.append("descripcion", descripcion);
      formData.append("visibilidad", visibilidad);
      formData.append("id_curso", cursoId);
      formData.append("file", files[0]);
      formData.append("uid", uid);

      const res = await fetch("/api/proyecto/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        let message = "Error al subir el proyecto";

        try {
          const data = await res.json();
          message = data.error || message;
        } catch {
          // la respuesta no tiene JSON
        }

        throw new Error(message);
      }

      onUploaded?.();
    } catch (err) {
      console.error(err);
      setError("Error al subir el proyecto");
    } finally {
      setSubiendo(false);
    }
  };

  const removeFile = (name: string) => {
    // ✅ CHANGE: función separada para legibilidad
    setFiles((prev) => prev.filter((f) => f.name !== name));
  };

  const filesList = files.map((file) => (
    <li key={file.name} className="relative">
      {/* ✅ CHANGE: quitado h-80 (rompía el layout) */}
      <Card className="relative p-4">
        <div className="absolute right-3 top-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Remove file"
            onClick={() => removeFile(file.name)}
          >
            <Trash className="h-5 w-5" aria-hidden />
          </Button>
        </div>

        <CardContent className="flex items-center gap-3 p-0 pr-10">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
            <FileIcon className="h-5 w-5 text-foreground" aria-hidden />
          </span>

          {/* ✅ CHANGE: truncate para nombres largos */}
          <div className="min-w-0">
            <p className="font-medium text-foreground truncate">{file.name}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {formatBytes(file.size)}
            </p>
          </div>
        </CardContent>
      </Card>
    </li>
  ));

  return (
    // ✅ CHANGE: ya NO centramos en pantalla (el modal ya se encarga). Usamos todo el ancho.
    <Card className="w-full max-w-none">
      <CardHeader>
        <CardTitle>Sube un proyecto</CardTitle>
        <CardDescription>
          Arrastra o carga un archivo para añadirlo a proyectos
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* ✅ CHANGE: quitado action/method (no estás posteando a servidor desde HTML) */}
        <form className="space-y-6">
          {/* ✅ CHANGE: 2 columnas en desktop para aprovechar el modal grande */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Izquierda: datos */}
            <div className="space-y-5">
              <div>
                <Label htmlFor="project-name" className="font-medium">
                  Nombre del proyecto
                </Label>
                <Input
                  id="project-name"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Nombre del proyecto"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="visibility" className="font-medium">
                    Visibilidad
                  </Label>
                  {/* ✅ CHANGE: defaultValue consistente con valores (private/public) */}
                  <Select
                    value={visibilidad}
                    onValueChange={(value) =>
                      setVisibilidad(value as "public" | "private")
                    }
                  >
                    <SelectTrigger
                      id="visibility"
                      name="visibility"
                      className="mt-2 w-full"
                    >
                      <SelectValue placeholder="Selecciona visibilidad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">Privado</SelectItem>
                      <SelectItem value="public">Público</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Solo tú puedes ver los privados.
                  </p>
                </div>

                <div>
                  <Label htmlFor="curso" className="font-medium">
                    Curso
                  </Label>

                  <Select value={cursoId} onValueChange={setCursoId}>
                    <SelectTrigger id="curso" className="mt-2 w-full">
                      <SelectValue placeholder="Selecciona un curso" />
                    </SelectTrigger>

                    <SelectContent className="max-h-48 overflow-y-auto">
                      {cursos.map((curso) => (
                        <SelectItem
                          key={`${curso.id_curso}-${curso.grado}`}
                          value={String(curso.id_curso)}
                        >
                          {curso.nombre}
                          {curso.grado ? ` (${curso.grado})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <p className="mt-2 text-sm text-muted-foreground">
                    Asocia el proyecto a un curso
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="font-medium">
                  Descripción
                </Label>
                <Textarea
                  id="description"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                />
              </div>
            </div>

            {/* Derecha: archivos */}
            <div className="space-y-5">
              <div>
                <Label htmlFor="file-upload-2" className="font-medium">
                  Cargar Archivo(s)
                </Label>

                <div
                  {...getRootProps()}
                  className={cn(
                    isDragActive
                      ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                      : "border-border",
                    // ✅ CHANGE: min-h para que el dropzone aproveche el espacio del modal
                    "mt-2 flex items-center justify-center rounded-md border border-dashed px-6 min-h-[320px] transition-colors duration-200"
                  )}
                >
                  <div className="text-center">
                    <FileIcon
                      className="mx-auto h-12 w-12 text-muted-foreground/80"
                      aria-hidden
                    />
                    <div className="mt-4 flex flex-wrap justify-center text-muted-foreground">
                      <p>Arrastra o</p>

                      {/* ✅ CHANGE: htmlFor coincide con el id real */}
                      <label
                        htmlFor="file-upload-2"
                        className="relative cursor-pointer rounded-sm px-1 font-medium text-primary hover:text-primary/80 hover:underline hover:underline-offset-4"
                      >
                        <span>escoge archivo(s)</span>

                        {/* ✅ CHANGE: mantenemos id compartido para accesibilidad */}
                        <input
                          {...getInputProps({
                            id: "file-upload-2",
                            name: "file-upload-2",
                          })}
                          type="file"
                          className="sr-only"
                        />
                      </label>

                      <p>para cargarlo(s)</p>
                    </div>

                    {/* ✅ CHANGE: feedback de error */}
                    {error && (
                      <p className="mt-3 text-sm text-destructive">{error}</p>
                    )}
                  </div>
                </div>

                <div className="mt-2 text-sm text-muted-foreground flex items-center justify-between gap-4">
                  <span>Puedes cargar cualquier imágen</span>
                  <span>Tamaño max. del archivo: 50MB</span>
                </div>
              </div>

              {filesList.length > 0 && (
                <div>
                  <h4 className="font-medium text-foreground">
                    Archivo(s) a subir
                  </h4>
                  {/* ✅ CHANGE: lista con scroll si hay muchos archivos */}
                  <ul
                    role="list"
                    className="mt-3 space-y-4 max-h-[260px] overflow-y-auto pr-1"
                  >
                    {filesList}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              // ✅ CHANGE: cancelar limpia + cierra (si el padre lo pasa)
              onClick={() => {
                setFiles([]);
                setError(null);
                onCancel?.();
              }}
            >
              Cancelar
            </Button>

            {/* ✅ CHANGE: mantenemos tu Dialog01, pero al “confirmar subida” puedes cerrar el modal */}
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={subiendo}
            >
              {subiendo ? "Subiendo..." : "Subir"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
