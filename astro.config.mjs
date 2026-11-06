// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
	integrations: [
		starlight({
			title: 'GomiGuide · Documentación técnica',
			description: 'Frontend, backend, auditorías y plan de refactorización de GomiGuide.',
			lastUpdated: false,
			sidebar: [
				{ label: 'Inicio', link: '/' },
				{
					label: 'Frontend',
					items: [
						{ label: 'Estado actual', slug: 'front/estado' },
						{ label: 'Cómo renderiza', slug: 'front/renderizado' },
						{ label: 'Dónde está cada cosa', slug: 'front/donde-esta' },
						{ label: 'APIs que usa', slug: 'front/apis' },
						{ label: 'Rutas y pantallas (generado)', slug: 'referencia/front-rutas' },
						{ label: 'Llamadas a la API (generado)', slug: 'referencia/front-apis' },
					],
				},
				{
					label: 'Backend',
					items: [
						{ label: 'Resumen y arranque', slug: 'backend/resumen' },
						{ label: 'Arquitectura por capas', slug: 'backend/arquitectura' },
						{ label: 'Qué le falta al backend', slug: 'backend/faltantes' },
						{ label: 'Problemas conocidos', slug: 'backend/problemas' },
						{ label: 'Rutas (generado)', slug: 'referencia/backend-rutas' },
						{ label: 'Modelo de datos (generado)', slug: 'referencia/backend-modelo' },
					],
				},
				{
					label: 'Discrepancias',
					items: [{ label: 'Front ↔ backend (generado)', slug: 'referencia/discrepancias' }],
				},
				{
					label: 'Auditorías',
					items: [
						{ label: 'Auditoría técnica original', slug: 'auditoria/original' },
						{ label: 'Auditoría front complementaria', slug: 'auditoria/complementaria' },
					],
				},
				{
					label: 'Refactorización',
					items: [{ label: 'Plan de refactorización front', slug: 'refactor/plan' }],
				},
			],
		}),
	],
});
