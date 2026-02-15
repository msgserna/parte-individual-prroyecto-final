"use client";

import Image from "next/image";
import { Card } from "@/app/frontend/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/frontend/components/ui/avatar";
import { ArrowRight, Calendar } from "lucide-react";
import { Badge } from "@/app/frontend/components/ui/badge";

type ProjectCardProps = {
  title: string;
  description: string;
  authorName: string;
  authorAvatar?: string;
  date: string;
  coverImage: string;
  cursoNombre?: string | null;
  cursoGrado?: string | null;
  isPrivate?: boolean;
};

function getCursoSiglas(nombreCurso: string | null) {
  if (!nombreCurso) return "";

  const curso = nombreCurso.toLowerCase();

  if (curso.includes("multiplataforma")) return "DAM";
  if (curso.includes("web")) return "DAW";
  if (curso.includes("sistemas")) return "ASIX";

  return nombreCurso;
}

export function ProjectCard({
  title,
  description,
  authorName,
  authorAvatar,
  date,
  coverImage,
  cursoNombre,
  cursoGrado,
  isPrivate = false, // 👈 default
}: ProjectCardProps) {
  const cursoLabel =
    cursoNombre && cursoGrado
      ? `${cursoGrado} ${getCursoSiglas(cursoNombre)}`
      : "Proyecto";

  return (
    <Card className="border border-[#123d58] bg-[#123d58] overflow-hidden shadow-xl group h-full flex flex-col relative py-0">
      <div className="w-full h-[220px] overflow-hidden relative">
        <Image
          src={coverImage}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#123d58] to-transparent opacity-60" />
        <Badge className="absolute top-4 right-4 bg-[#D65A7E] hover:bg-[#b54666] text-white border-none shadow-lg">
          {cursoLabel}
        </Badge>
        {isPrivate && (
          <span className="absolute top-14 right-4 rounded-full bg-black/60 px-2 py-1 text-[11px] text-white backdrop-blur">
            🔒 Privado
          </span>
        )}
      </div>

      <div className="pt-6 px-6 pb-3 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-[#D65A7E] transition-colors">
          {title}
        </h3>

        <p className="text-gray-400 text-sm mb-6 line-clamp-2 flex-grow">
          {description}
        </p>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#D65A7E]" />
              <span>{date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Avatar className="h-7 w-7 border border-white/20">
                {authorAvatar && (
                  <AvatarImage src={authorAvatar} alt={authorName} />
                )}
                <AvatarFallback className="bg-white/10 text-xs">
                  {authorName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-medium text-white/90">
                {authorName}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#1a6b7a]">
            <div className="flex items-center gap-2 text-sm text-gray-300" />
            <span
              className="flex items-center gap-1 text-[#D65A7E] text-sm font-medium group-hover:translate-x-1 transition-transform"
            >
              Ver proyecto <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
