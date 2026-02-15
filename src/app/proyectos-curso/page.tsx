import { Suspense } from "react"
import ProyectosCursoClient from "./ProyectosCursoClient"

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8">Cargando proyectos...</div>}>
      <ProyectosCursoClient />
    </Suspense>
  )
}
