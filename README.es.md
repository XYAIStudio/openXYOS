# openXYOS

**Languages:** [簡體中文](README.md) · [繁體中文](README.zh-TW.md) · [English](README.en.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Français](README.fr.md) · [Español](README.es.md) · [Índice de instalación](docs/i18n/README.md) · [Política de localización](docs/i18n/POLICY.md)

Repositorio: [github.com/XYAIStudio/openXYOS](https://github.com/XYAIStudio/openXYOS)

openXYOS es un sistema operativo de código abierto para organizaciones humano–IA, derivado y simplificado desde XYOS. Conserva organizaciones multinivel, multiinquilino, modularidad, colaboración gobernada, personalización de agentes, chat directo/grupal y módulos de ejemplo extensibles.

> Estado: candidato de publicación comunitaria para desarrollo y evaluación local. **No se presenta como listo para producción.**

## Comunidad de desarrolladores

Únete al grupo **XYAI Founders** (WeCom / 企业微信) para hablar sobre uso, extensión y contribuciones a openXYOS. Escanea el QR con WeCom; si caduca, mira [Discussions #12](https://github.com/XYAIStudio/openXYOS/discussions/12).

<p align="center">
  <img src="docs/community/assets/xyai-founders-wecom-qr.png" width="240" alt="QR WeCom XYAI Founders" />
</p>

## Alcance en tiempo de ejecución

Tras iniciar sesión hay doce módulos: Espacio de trabajo, Anuncios, Organización, Recursos humano–IA, Habilidades y plugins, Colaboración, Agent Studio, Tareas, Conocimiento, Reflexión, Gobernanza y Ajustes.

Los administradores del inquilino pueden activar/desactivar módulos configurables y renombrar etiquetas. Espacio de trabajo y Ajustes son módulos base y no se pueden desactivar.

## Ciclo de vida del agente

Define nombre, posicionamiento, capacidades y experiencia; sube documentos autorizados; opcionalmente vincula una URL ima. Los archivos se revisan y se extrae texto hacia el blueprint.

El agente consultor generado entra automáticamente en el Talent Market; tras el reclutamiento pasa a empleado de reserva, donde un administrador asigna responsabilidades y departamento. Las salidas de alto riesgo requieren revisión humana por defecto. La URL ima permanece «vinculada, sin verificar» hasta que un conector la valide.

## Inicio rápido

Se requiere Node.js 20.19 o superior.

```bash
npm ci
cp .env.example .env
npm run dev
```

Sustituye los secretos antes de arrancar. Cliente: `http://localhost:5174`; API: `http://localhost:3000/api`.

## Verificación

```bash
npm run lint
npm run typecheck
npm test
npm run verify:open-source
npm run build
```

Consulta la [guía comunitaria](docs/community/README.md), [índice de idiomas](docs/i18n/README.md), [alcance open source](docs/open-source-scope.md), [seguridad](SECURITY.md) y [contribución](CONTRIBUTING.md). Preguntas de uso: [Discussions Q&A](https://github.com/XYAIStudio/openXYOS/discussions/new?category=q-a). Licencia [Apache 2.0](LICENSE).
