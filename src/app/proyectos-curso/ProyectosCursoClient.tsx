"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { AppSidebar } from "@/app/frontend/compartir-proyectos/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/app/frontend/components/ui/sidebar";

import { Baskervville, Montserrat } from "next/font/google";
import { Button } from "@/app/frontend/components/ui/button";
import Image from "next/image";
import { ProjectCard } from "@/app/frontend/components/ui/projectCard";
import Link from "next/link";
import { motion } from "framer-motion";

import UploadDialog from "@/app/frontend/components/upload";

const baskervville = Baskervville({ weight: "400", subsets: ["latin"] });
const montserrat = Montserrat({ subsets: ["latin"] });
const getPicsum = (seed: string | number, w: number, h: number) =>
  `https://picsum.photos/seed/${encodeURIComponent(String(seed))}/${w}/${h}`;

type Proyecto = {
  id_proyecto: number;
  titulo: string;
  descripcion: string;
  fecha: string;
  imagen: string | null;
  autor_nombre: string | null;
  autor_avatar: string | null;
  curso_nombre: string | null;
  curso_grado: number | null;
  visibilidad: "public" | "private";
  id_usuario: number | null;
};

type Curso = {
  id_curso: number;
  nombre: string;
  grado: number | null;
};

function getCursoSiglas(nombreCurso: string | null) {
  if (!nombreCurso) return "";

  const curso = nombreCurso.toLowerCase();

  if (curso.includes("multiplataforma")) return "dam";
  if (curso.includes("web")) return "daw";
  if (curso.includes("sistemas")) return "asix";

  return nombreCurso.toLowerCase();
}

function getCursoLabel(curso: Curso) {
  return curso.grado
    ? `${curso.nombre} (${curso.grado})`
    : curso.nombre;
}

export default function Page() {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [proyectos, setProyectos] = React.useState<Proyecto[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [categoryFilter, setCategoryFilter] = React.useState("");
  const [cursos, setCursos] = React.useState<Curso[]>([]);
  const [openCategoryFilter, setOpenCategoryFilter] = useState(false);
  const categoryFilterRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProyectos = async () => {
      try {
        const res = await fetch("/api/proyecto");
        if (!res.ok) throw new Error("Error al cargar proyectos");
        setProyectos(await res.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    const fetchCursos = async () => {
      try {
        const res = await fetch("/api/cursos");
        if (!res.ok) throw new Error("Error al cargar cursos");
        setCursos(await res.json());
      } catch (e) {
        console.error(e);
      }
    };

    fetchProyectos();
    fetchCursos();
  }, []);

  const proyectosPermitidos = proyectos.filter((proyecto) => {
    return proyecto.visibilidad === "public";
  });

  const normalizedFilter = categoryFilter
    .replace(/\(\d+\)/g, "")
    .trim()
    .toLowerCase();

  const proyectosFiltrados = proyectosPermitidos.filter((proyecto) => {
    if (!normalizedFilter) return true;
    const cursoNombre = proyecto.curso_nombre ?? "";
    const cursoGrado = proyecto.curso_grado !== null ? String(proyecto.curso_grado) : "";
    const cursoSiglas = getCursoSiglas(cursoNombre);
    const etiqueta = `${cursoGrado} ${cursoSiglas}`.trim();
    const categoria = cursoNombre.toLowerCase();
    return (
      categoria.includes(normalizedFilter) ||
      etiqueta.includes(normalizedFilter) ||
      cursoSiglas.includes(normalizedFilter)
    );
  });

  const proyectosVisibles =
    categoryFilter.trim() === ""
      ? proyectosFiltrados.slice(0, 6)
      : proyectosFiltrados;

  const cursosUnicos = React.useMemo(() => {
    const map = new Map<string, Curso>();

    cursos.forEach((curso) => {
      const key = `${curso.nombre}-${curso.grado}`;
      if (!map.has(key)) {
        map.set(key, curso);
      }
    });

    return Array.from(map.values());
  }, [cursos]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!openCategoryFilter) return;
      const target = event.target as Node;
      const container = categoryFilterRef.current;
      if (container && !container.contains(target)) {
        setOpenCategoryFilter(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openCategoryFilter]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="absolute top-4 left-4 z-50">
          <SidebarTrigger className="bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/20" />
        </div>

        <div className="relative flex items-center justify-center p-4 md:p-8 lg:p-16 min-h-[50vh]">
          <div className="absolute inset-0 z-0">
            <Image
              src="/imagenes/proyectos_home.png"
              alt="Sistema Operativo Background"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/50" />
          </div>

          <div className="relative z-10 flex flex-col items-center justify-center gap-8 max-w-7xl w-full px-4 text-center">
            <div className="max-w-3xl w-full space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`${baskervville.className} text-4xl md:text-6xl font-normal text-white leading-tight drop-shadow-lg`}
              >
                Proyectos de estudiantes
              </motion.h1>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex-shrink-0"
            >
              <Button
                size="lg"
                className={`${montserrat.className} border border-[#D65A7E]/70 bg-[#D65A7E]/30 text-white font-medium text-lg px-8 py-6 rounded-md backdrop-blur-sm transition-all hover:bg-[#D65A7E]/40 hover:border-[#D65A7E] hover:text-white/95 hover:scale-[1.01]`}
                type="button"
                onClick={() => setUploadOpen(true)}
              >
                Añadir archivo
              </Button>
            </motion.div>
          </div>
        </div>

        <div className="px-6 md:px-10 lg:px-16 mt-6">
          <div className="max-w-7xl mx-auto">
            <div ref={categoryFilterRef} className="relative w-full max-w-md">
              <button
                type="button"
                onClick={() => setOpenCategoryFilter((prev) => !prev)}
                className={`${montserrat.className} flex h-11 w-full items-center justify-between rounded-lg border border-[#123d58]/25 bg-[#f5f7f9] px-4 text-sm text-[#123d58] transition hover:bg-[#eef2f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#123d58]/15`}
              >
                <span className="truncate text-[#123d58]">
                  {categoryFilter || "Filtrar por categoría"}
                </span>
                <span className="text-xs opacity-60">▾</span>
              </button>

              {openCategoryFilter && (
                <div className="absolute left-0 top-12 z-50 w-full max-h-48 overflow-auto rounded-lg border border-black/10 bg-white p-1 text-sm shadow-lg">
                  {cursosUnicos.map((curso) => (
                    <button
                      key={`${curso.id_curso}-${curso.grado}`}
                      type="button"
                      onClick={() => {
                        setCategoryFilter(getCursoLabel(curso));
                        setOpenCategoryFilter(false);
                      }}
                      className="w-full rounded-md px-3 py-2 text-left hover:bg-black/[.04]"
                    >
                      {getCursoLabel(curso)}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setCategoryFilter("");
                      setOpenCategoryFilter(false);
                    }}
                    className="w-full rounded-md px-3 py-2 text-left opacity-60 hover:bg-black/[.04]"
                  >
                    Quitar filtro
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-8 md:p-16 pt-6 md:pt-10">
          <div className="max-w-7xl mx-auto space-y-8">
            {categoryFilter.trim() === "" && !loading && (
              <p className="text-lg text-[#0E4A54]/70 font-medium">
                Últimos proyectos subidos
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 lg:gap-12">
              {loading && (
                <p className="text-white/80">Cargando proyectos...</p>
              )}

              {!loading && proyectos.length === 0 && (
                <p className="text-white/80">No hay proyectos todavia</p>
              )}

              {!loading && proyectos.length > 0 && proyectosFiltrados.length === 0 && (
                <p className="text-white/80">No hay proyectos para esa categoria</p>
              )}

              {!loading &&
                proyectosVisibles.map((proyecto) => (
                  <Link
                    key={proyecto.id_proyecto}
                    href={`/proyecto/${proyecto.id_proyecto}`}
                  >
                    <ProjectCard
                      title={proyecto.titulo}
                      description={proyecto.descripcion}
                      authorName={proyecto.autor_nombre ?? "Usuario"}
                      authorAvatar={proyecto.autor_avatar ?? undefined}
                      date={new Date(proyecto.fecha).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                      coverImage={
                        proyecto.imagen ??
                        getPicsum(proyecto.id_proyecto, 600, 400)
                      }
                      cursoNombre={proyecto.curso_nombre}
                      cursoGrado={
                        proyecto.curso_grado !== null
                          ? String(proyecto.curso_grado)
                          : null
                      }
                      isPrivate={proyecto.visibilidad === "private"}
                    />
                  </Link>
                ))}
            </div>
          </div>
        </div>

        <UploadDialog
          open={uploadOpen}
          onOpenChange={setUploadOpen}
          title="Subir archivo"
          cursos={cursosUnicos}
          uid={null}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
