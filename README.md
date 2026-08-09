# Kiwify — Landing Page

Landing page conceitual da Kiwify desenvolvida pela **Verus Studio**, com foco em direção de arte, responsividade e interações ligadas ao scroll.

![Prévia do projeto](assets/og-image.png)

## Demo

[Acessar o projeto no GitHub Pages](https://verus-std.github.io/project-kiwify/)

## Tecnologias

- HTML5 semântico
- CSS responsivo com animações nativas
- JavaScript sem framework
- [Lenis](https://github.com/darkroomengineering/lenis) para scroll suave
- GitHub Pages com publicação direta pela branch `main`

## Desenvolvimento local

Requer Node.js 20 ou superior e Python 3 para o servidor local.

```bash
npm ci
npm run dev
```

O projeto ficará disponível em `http://127.0.0.1:4173/`.

## Build

```bash
npm run build
```

O comando gera a pasta `dist/`, copia apenas os arquivos públicos e inclui a versão local do Lenis usada em produção. Todas as referências de imagens, vídeos, scripts e estilos são verificadas durante o build.

## Publicação

O GitHub Pages publica diretamente a raiz da branch `main`. Como o site é estático, os arquivos fonte já ficam prontos para servir sem uma etapa de build no servidor.

## Organização dos assets

- `assets/branding/`: logotipo e favicon
- `assets/video/`: vídeo da hero
- `assets/backgrounds/`: fundos das seções
- `assets/benefits/`: imagens dos benefícios
- `assets/technology/`: cards da seção de tecnologia
- `source-assets/`: arquivos originais e versões antigas preservadas apenas localmente; a pasta não é enviada ao GitHub

## Aviso

Projeto fictício criado para fins de estudo e portfólio. Não é uma página oficial e não possui vínculo comercial com a Kiwify. Marcas e elementos visuais pertencem aos seus respectivos titulares.
