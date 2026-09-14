# ValorMóvil (PhoneValue)

Prototipo web en español que estima **cuanto del hardware y las funciones de tu móvil aprovechas de verdad** — en % y en euros — y recomienda alternativas más baratas que encajan con tu uso real.

> Demo con datos simulados. En Android real se usaria `UsageStats` y señales del sistema.

## Cómo ejecutar

```bash
npm install
npm run dev
```

Abre la URL que muestre Vite (normalmente `http://localhost:5173`).

Otros comandos:

```bash
npm test          # tests del motor (Vitest)
npm run build     # build de produccion
npm run preview   # previsualizar el build
```

## Que incluye

1. **Onboarding** — precio de compra, presupuesto siguiente, tipo de uso (ligero / equilibrado / gaming-foto) y boton de perfil demo.
2. **Dashboard** — utilización global S%, € aprovechados vs desperdiciados, desglose de 10 categorias con barras y badges *medido* / *estimado*.
3. **Detalle de categoria** — modal con nota de cómo se calcula.
4. **Recomendaciones** — top 3 del catalogo local filtrado por presupuesto y necesidades, con precio, encaje, ahorro estimado y motivos.
5. **Nota de transparencia** — deja claro que son datos demo.

## Motor

Pesos (suman 100 %):

| Categoria        | Peso |
|------------------|------|
| SoC              | 16   |
| Pantalla         | 18   |
| Cámara           | 18   |
| Almacenamiento   | 8    |
| RAM              | 8    |
| Batería + carga  | 12   |
| Conectividad     | 6    |
| Audio            | 4    |
| Sensores y pagos | 5    |
| Software / marca | 5    |

Formulas:

- `€_asignados = P × w/100`
- `€_aprov = asignados × u/100`
- `desperdicio = asignados − aprov`
- `S = 100 × Σ aprov / P`

Perfil demo `P = 1000 €` → ~**310 €** aprovechados / ~**690 €** desperdiciados / ~**31 %**.

Recomendacion: catalogo JSON local (22 móviles), filtro duro por presupuesto (+5 %) y necesidades, penalizacion asimetrica α≈1.2 (infra) / β≈0.4 (exceso), top 3.

## Stack

- Vite + React 19 + TypeScript
- Tailwind CSS v4
- Vitest (tests unitarios del motor)

## Estructura clave

```
src/
  engine/          # calculo, pesos, recomendacion + tests
  data/            # perfil demo + catalogo de móviles
  components/      # UI en español
  App.tsx
```

## Licencia

Prototipo privado — uso interno / demo.
