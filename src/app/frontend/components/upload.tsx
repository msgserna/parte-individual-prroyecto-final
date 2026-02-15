// upload.tsx
// ✅ CHANGE: Este archivo es el "wrapper" del modal.
// Aquí controlamos tamaño/scroll (lo que antes te dejaba un bloque estrecho en el centro).
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/frontend/components/ui/dialog";
import FileUpload03 from "@/app/frontend/components/file-upload-03";

type Curso = {
  id_curso: number;
  nombre: string;
  grado: number | null;
};

type UploadDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  cursos: Curso[];
  uid: string | null;
};

export default function UploadDialog({
  open,
  onOpenChange,
  title = "Subir archivo",
  cursos,
  uid,
}: UploadDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* ✅ CHANGE: tamaño grande + altura fija para que el scroll sea interno y no “rompa” el layout */}
      <DialogContent className="w-[96vw] sm:max-w-6xl h-[90vh] p-0 overflow-hidden">
        {/* ✅ CHANGE: header separado con border, así el título queda fijo */}
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {/* ✅ CHANGE: scroll solo dentro del contenido */}
        <div className="flex-1 overflow-y-auto p-6">
          <FileUpload03
            cursos={cursos}
            uid={uid}
            onCancel={() => onOpenChange(false)}
            onUploaded={() => onOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
