import Link from "next/link"

export default function Footer() {
  return (
    <footer className="w-full border-t border-border/40 bg-card py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-3">
            <h3 className="font-bold text-lg">Luminow</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              La forma más rápida e inteligente de gestionar las citas y clientes de tu negocio local.
            </p>
          </div>

          {/* Product links */}
          <div>
            <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-3">Producto</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#hero" className="hover:text-foreground transition-colors">Inicio</a></li>
              <li><a href="#como-funciona" className="hover:text-foreground transition-colors">Cómo funciona</a></li>
              <li><a href="#precios" className="hover:text-foreground transition-colors">Precios</a></li>
              <li><Link href="/book/demo" className="text-primary hover:underline font-medium">Ejemplo Demo Pública (/book/demo)</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-3">Legal</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Términos de servicio</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Política de privacidad</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Políticas de cookies</a></li>
            </ul>
          </div>

          {/* Support / Contact */}
          <div>
            <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-3">Soporte</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><span>Email: soporte@luminow.com</span></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Centro de ayuda</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Contacto directo</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/20 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <span>&copy; {new Date().getFullYear()} Luminow. Todos los derechos reservados.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-foreground transition-colors">Twitter</a>
            <a href="#" className="hover:text-foreground transition-colors">Instagram</a>
            <a href="#" className="hover:text-foreground transition-colors">LinkedIn</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
