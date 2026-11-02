# Graph Report - jg-store  (2026-11-02)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 2605 nodes · 7390 edges · 149 communities (98 shown, 51 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 38 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5063009d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- sidebar.tsx
- cn
- infobar.tsx
- form.ts
- store-service.ts
- api_server.py
- ref_react
- data-table-faceted-filter.tsx
- kanban.tsx
- conversation-list.tsx
- store-front.tsx
- src/app/layout.tsx
- utils.ts
- 20260925_full_schema_and_seed.sql
- order-detail-sheet.tsx
- main.py
- rules
- Badge
- actualizar_stock.py
- scraping_product.py
- FeatureCleanup
- Card
- tanstack-basic-auth/package.json
- PageContainer
- getQueryClient
- Button
- dependencies
- combobox.tsx
- categories.ts
- notifications-page.tsx
- sheet-form-demo.tsx
- react-router-basic-auth/package.json
- vue-basic-auth/package.json
- TiendanubeClient
- types/store.ts
- sign-in-view.tsx
- StoreProduct
- react-basic-auth/package.json
- multi-step-product-form.tsx
- @tanstack/react-query
- data-table.tsx
- file-uploader.tsx
- chrome-ext-basic-auth/package.json
- types/data-table.ts
- requests
- package.json
- Producto
- compilerOptions
- subida_tienda.py
- devDependencies
- product-tables/index.tsx
- contingencia_borrar_subcategorias.py
- dialog.tsx
- compilerOptions
- astro-basic-auth/package.json
- compilerOptions
- ai_estimator.py
- components.json
- nextjs-basic-auth/package.json
- CodeAnalyzer
- logger.py
- orders-table/index.tsx
- @base-ui/react
- users-table/index.tsx
- drawer.tsx
- @react-router/dev
- json
- scripts
- scraper-process.ts
- migrate/route.ts
- recent-sales.tsx
- carousel.tsx
- toast.tsx
- FUNDING.yml
- .oxfmtrc.json
- demo-form.tsx
- ScraperProcessManager
- 20260925_products_and_variants_schema.sql
- nuxt-basic-auth/package.json
- @tabler/icons-react
- ref_path
- breadcrumbs.tsx
- main.tsx
- compilerOptions
- router.tsx
- interface
- image/route.ts
- sonner
- advanced-form-patterns.tsx
- 20260926_create_orders_tables.sql
- compilerOptions
- run-remote-migrations.ts
- scraper/products/margins/route.ts
- reset/route.ts
- scraper/products/route.ts
- overrides
- CronManager
- ProcessState
- cron/route.ts
- scraper/products/stock/route.ts
- stream/route.ts
- 20260917_create_products_table.sql
- openpyxl
- IconsViewPage
- [[...profile]]/page.tsx
- astro-basic-auth/tsconfig.json
- auth_middleware
- inspect-remote-db.ts
- auth/layout.tsx
- src/proxy.ts
- api-specs-context.sh
- execute-request.sh
- extract-endpoint-detail.sh
- extract-tag-endpoints.sh
- @clerk/ui@^1.32.2
- cmdk
- date-fns
- @dnd-kit/core
- @dnd-kit/modifiers@^9.0.0
- @dnd-kit/sortable
- @dnd-kit/utilities
- embla-carousel-react
- match-sorter
- next@16.2.12
- nextjs-toploader
- pg@^8.23.0
- postcss@8.5.25
- react-dropzone
- sharp@^0.35.3
- @supabase/supabase-js@^2.49.1
- @tanstack/react-query-devtools
- uuid
- vaul@^1.1.2
- zustand
- bun-test.d.ts
- scraping-coronel

## God Nodes (most connected - your core abstractions)
1. `cn()` - 438 edges
2. `Button()` - 125 edges
3. `Icons` - 93 edges
4. `Card()` - 46 edges
5. `CardHeader()` - 46 edges
6. `CardContent()` - 42 edges
7. `@base-ui/react` - 42 edges
8. `PageContainer()` - 41 edges
9. `Badge()` - 38 edges
10. `Field()` - 36 edges

## Surprising Connections (you probably didn't know these)
- `main()` --calls--> `auditProductImages()`  [EXTRACTED]
  scripts/audit-product-images.ts → src/lib/product-audit.ts
- `react-dom@^19.0.0` --declares--> `react-dom`  [EXTRACTED]
  .agents/skills/clerk-tanstack-patterns/templates/tanstack-basic-auth/package.json → package.json
- `typescript@^5.6.0` --declares--> `typescript`  [EXTRACTED]
  .agents/skills/clerk-tanstack-patterns/templates/tanstack-basic-auth/package.json → package.json
- `react-dom@^19.2.7` --declares--> `react-dom`  [EXTRACTED]
  .agents/skills/clerk-react-router-patterns/templates/react-router-basic-auth/package.json → package.json
- `typescript@latest` --declares--> `typescript`  [EXTRACTED]
  .agents/skills/clerk-vue-patterns/templates/vue-basic-auth/package.json → package.json

## Import Cycles
- None detected.

## Communities (149 total, 51 thin omitted)

### Community 0 - "sidebar.tsx"
Cohesion: 0.07
Nodes (84): config, AppSidebar(), Icon, AppSidebar(), UserNav(), AlertModal(), NavMain(), NavProjects() (+76 more)

### Community 1 - "cn"
Cohesion: 0.04
Nodes (74): Accordion(), AccordionContent(), AccordionItem(), AccordionTrigger(), AlertAction(), AspectRatio(), Attachment(), AttachmentAction() (+66 more)

### Community 2 - "infobar.tsx"
Cohesion: 0.05
Nodes (67): productInfoContent, DashboardLayout(), metadata, KBar(), defaultData, InfoSidebar(), ThemeModeToggle(), Heading() (+59 more)

### Community 3 - "form.ts"
Cohesion: 0.12
Nodes (52): CheckboxField(), CheckboxGroupField(), ColorField(), DatePickerField(), DateRangeField(), FileUploadField(), OtpField(), RadioGroupField() (+44 more)

### Community 4 - "store-service.ts"
Cohesion: 0.06
Nodes (58): dynamic, GET(), DELETE(), dynamic, GET(), Params, PUT(), dynamic (+50 more)

### Community 5 - "api_server.py"
Cohesion: 0.06
Nodes (36): continue_scraping(), CronConfigRequest, delete_products(), DeleteProductsRequest, get_cron_status(), get_image(), get_preview(), get_products() (+28 more)

### Community 6 - "ref_react"
Cohesion: 0.06
Nodes (19): baseConfig, @sentry/nextjs, config, nextConfig, metadata, GeneralConfigPage(), AreaStatsError(), BarStatsError() (+11 more)

### Community 7 - "data-table-faceted-filter.tsx"
Cohesion: 0.11
Nodes (45): react-day-picker, @tanstack/react-table, ComboboxField(), ButtonGroup(), ButtonGroupSeparator(), ButtonGroupText(), buttonGroupVariants, Command() (+37 more)

### Community 8 - "kanban.tsx"
Cohesion: 0.07
Nodes (49): metadata, page(), animateLayoutChanges(), coordinateGetter(), directions, dropAnimation, GetItemValue, Kanban() (+41 more)

### Community 9 - "conversation-list.tsx"
Cohesion: 0.08
Nodes (42): motion@^11.18.2, motion, metadata, Page(), Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup() (+34 more)

### Community 10 - "store-front.tsx"
Cohesion: 0.14
Nodes (34): FavoritosPage(), metadata, HomePage(), metadata, Logo(), CartDrawer(), CategoryBar(), FavoritesPageLayout() (+26 more)

### Community 11 - "src/app/layout.tsx"
Cohesion: 0.09
Nodes (29): kbar@^0.1.0-beta.48, kbar, next-themes, Providers(), THEME_PREVIEWS, ThemeColorPreset, ThemeConfigPage(), META_THEME_COLORS (+21 more)

### Community 12 - "utils.ts"
Cohesion: 0.10
Nodes (35): SubmitButton(), Bubble(), BubbleContent(), BubbleGroup(), BubbleReactions(), bubbleReactionsVariants, bubbleVariants, LoadingButton() (+27 more)

### Community 13 - "20260925_full_schema_and_seed.sql"
Cohesion: 0.09
Nodes (37): idx_favorites_product, idx_favorites_user, idx_users_correo, idx_users_rol, idx_users_usuario, public.favorites, public.users, public.vw_favoritos_detalle (+29 more)

### Community 14 - "order-detail-sheet.tsx"
Cohesion: 0.10
Nodes (32): orderDetailQueryOptions(), orderDetailQueryOptionsKey(), orderKeys, getOrderById(), getOrders(), mockOrders, removeOrderItem(), updateOrderItemQuantity() (+24 more)

### Community 15 - "main.py"
Cohesion: 0.11
Nodes (15): run_stock(), get_chrome_driver(), create_floating_button(), descargar_lista_precios(), login(), consolidar_todo_en_base_de_datos(), set_margenes(), preguntar_download() (+7 more)

### Community 16 - "rules"
Cohesion: 0.05
Nodes (38): categories, correctness, suspicious, Image, Link, env, browser, es6 (+30 more)

### Community 17 - "Badge"
Cohesion: 0.13
Nodes (29): recharts, Stats(), Badge(), badgeVariants, ChartConfig, ChartContainer(), ChartContext, ChartContextProps (+21 more)

### Community 18 - "actualizar_stock.py"
Cohesion: 0.08
Nodes (15): buscar_en_excel_map(), cargar_mapa_excel(), formatear_codigo(), formatear_duracion(), get_current_page_from_url(), is_last_page(), limpiar_precio_float(), scraping_all_product() (+7 more)

### Community 19 - "scraping_product.py"
Cohesion: 0.09
Nodes (12): limpiar_codigos_sqlite(), boton_esta_deshabilitado(), scraping_all_product(), _descargar_galeria_async(), _descargar_imagen_async(), formatear_codigo(), generar_slug(), inicializar_bd() (+4 more)

### Community 20 - "FeatureCleanup"
Cohesion: 0.14
Nodes (12): checkGitSafe(), DOC_RULES, { execSync }, FeatureCleanup, FEATURES, fs, listFeatures(), main() (+4 more)

### Community 21 - "Card"
Cohesion: 0.20
Nodes (19): Loading(), Loading(), OverViewLayout(), Loading(), Loading(), FormCardSkeleton(), Card(), CardAction() (+11 more)

### Community 22 - "tanstack-basic-auth/package.json"
Cohesion: 0.08
Nodes (29): @vitejs/plugin-react@^4.0.0, @vitejs/plugin-react, dependencies, @clerk/tanstack-react-start@latest, react@^19.0.0, react-dom@^19.0.0, @tanstack/react-router-devtools@latest, @tanstack/react-start@latest (+21 more)

### Community 23 - "PageContainer"
Cohesion: 0.14
Nodes (20): StatsError(), StatsErrorProps, metadata, Page(), BillingPage(), ExclusivePage(), metadata, Page() (+12 more)

### Community 24 - "getQueryClient"
Cohesion: 0.12
Nodes (18): Params, fakeUsers, INITIAL_JG_USERS, User, createUserMutation, deleteUserMutation, updateUserMutation, userKeys (+10 more)

### Community 25 - "Button"
Cohesion: 0.13
Nodes (19): NotFound(), CtaGithub(), Header(), SearchInput(), AlertDialogAction(), AlertDialogCancel(), AlertDialogContent(), AlertDialogDescription() (+11 more)

### Community 26 - "dependencies"
Cohesion: 0.07
Nodes (27): dependencies, ai@^7.0.44, next-themes@^0.4.6, nuqs@^2.8.9, react@19.2.4, react-day-picker@^10.0.1, react-responsive@^10.0.1, recharts@3.8.0 (+19 more)

### Community 27 - "combobox.tsx"
Cohesion: 0.11
Nodes (21): ComboboxChip(), ComboboxChips(), ComboboxChipsInput(), ComboboxClear(), ComboboxContent(), ComboboxEmpty(), ComboboxGroup(), ComboboxInput() (+13 more)

### Community 28 - "categories.ts"
Cohesion: 0.14
Nodes (17): LandingConfigPage(), CategoryBarProps, CategoryCircleItem(), CategoryShowcase(), CategoryShowcaseProps, CATEGORY_MAP, formatCategoryBreadcrumb(), getSubcategoriesByCategory() (+9 more)

### Community 29 - "notifications-page.tsx"
Cohesion: 0.14
Nodes (21): metadata, Page(), ActionStyle, ActionType, formatDate(), getActionIcon(), NotificationAction, NotificationCard() (+13 more)

### Community 30 - "sheet-form-demo.tsx"
Cohesion: 0.18
Nodes (19): CardDescription(), CardTitle(), FieldGroup(), GithubSignInButton(), formSchema, UserAuthForm(), categoryOptions, dialogFormSchema (+11 more)

### Community 31 - "react-router-basic-auth/package.json"
Cohesion: 0.10
Nodes (15): middleware, dependencies, @clerk/react-router@^3.5.5, react@^19.2.7, react-dom@^19.2.7, react-router@^8.0.0, react, name (+7 more)

### Community 32 - "vue-basic-auth/package.json"
Cohesion: 0.11
Nodes (19): dependencies, @clerk/vue@latest, vue@latest, devDependencies, typescript@latest, vite@latest, @vitejs/plugin-vue@latest, vue-tsc@latest (+11 more)

### Community 34 - "types/store.ts"
Cohesion: 0.18
Nodes (18): POST(), CarouselSlide, PromoCarouselProps, SLIDES, createOrder(), CartStore, refreshCartItems(), buildWhatsAppUrl() (+10 more)

### Community 35 - "sign-in-view.tsx"
Cohesion: 0.14
Nodes (16): metadata, Page(), metadata, Page(), metadata, Page(), metadata, Page() (+8 more)

### Community 36 - "StoreProduct"
Cohesion: 0.15
Nodes (18): HorizontalProductRowProps, ProductCardProps, ProductDetailPageLayoutProps, ProductDetailViewProps, ProductGridProps, ProductQuickViewProps, SearchSidebarFilter(), SearchSidebarFilterProps (+10 more)

### Community 37 - "react-basic-auth/package.json"
Cohesion: 0.11
Nodes (22): devDependencies, @types/react@latest, @types/react-dom@latest, typescript@latest, devDependencies, @types/react@^19.0.0, @types/react-dom@^19.0.0, typescript@^5.6.0 (+14 more)

### Community 38 - "multi-step-product-form.tsx"
Cohesion: 0.13
Nodes (18): @tanstack/react-form, zod, metadata, Page(), FormsShowcasePage(), categoryOptions, MultiStepProductForm(), productFormSchema (+10 more)

### Community 39 - "@tanstack/react-query"
Cohesion: 0.15
Nodes (16): @tanstack/react-query, metadata, Page(), PageProps, metadata, ReactQueryPage(), productByIdOptions(), Product (+8 more)

### Community 40 - "data-table.tsx"
Cohesion: 0.22
Nodes (17): Loading(), Loading(), ScrollArea(), ScrollBar(), DataTable(), DataTableProps, DataTableSkeleton(), DataTableSkeletonProps (+9 more)

### Community 41 - "file-uploader.tsx"
Cohesion: 0.15
Nodes (17): FileCard(), FileCardProps, FileUploader(), FileUploaderProps, isFileWithPreview(), Progress(), ProgressIndicator(), ProgressLabel() (+9 more)

### Community 42 - "chrome-ext-basic-auth/package.json"
Cohesion: 0.10
Nodes (18): dependencies, @clerk/chrome-extension@latest, plasmo@latest, react@latest, react-dom@latest, displayName, react, manifest (+10 more)

### Community 43 - "types/data-table.ts"
Cohesion: 0.16
Nodes (16): DataTableConfig, dataTableConfig, UseDataTableProps, getDefaultFilterOperator(), getFilterOperators(), filterItemSchema, FilterItemSchema, sortingItemSchema (+8 more)

### Community 44 - "requests"
Cohesion: 0.15
Nodes (8): test_connection(), eliminar_categorias_duplicadas(), get_all_categories(), analizar_categorias(), get_all_categories(), get_all_products(), mover_productos_libreria(), normalizar_nombre()

### Community 45 - "package.json"
Cohesion: 0.10
Nodes (20): @ai-sdk/react@^4.0.47, clsx@^2.1.1, input-otp@^1.4.2, react-resizable-panels@^4.12.2, @shadcn/react@^0.2.1, sort-by@^1.2.0, @types/pg@^8.23.1, description (+12 more)

### Community 47 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 48 - "subida_tienda.py"
Cohesion: 0.19
Nodes (7): actualizar_producto(), buscar_producto_por_sku(), crear_producto(), limpiar_cache_productos(), registrar_error(), run_sync(), procesar_un_producto()

### Community 49 - "devDependencies"
Cohesion: 0.11
Nodes (19): devDependencies, @faker-js/faker@^9.9.0, husky@^9.1.7, lint-staged@^15.5.2, oxfmt@^0.42.0, oxlint@^1.57.0, tw-animate-css@^1.4.0, @types/node@22.10.2 (+11 more)

### Community 50 - "product-tables/index.tsx"
Cohesion: 0.21
Nodes (14): nuqs, metadata, Page(), pageProps, productKeys, productsQueryOptions(), ProductCommandBar(), ProductCommandBarProps (+6 more)

### Community 51 - "contingencia_borrar_subcategorias.py"
Cohesion: 0.17
Nodes (9): configurar_credenciales(), construir_mapas_categorias(), eliminar_categoria_api(), eliminar_categoria_por_nombre_y_sus_hijas(), eliminar_nietos_de_categoria_referencia(), eliminar_rama_recursivamente(), imprimir_y_contar_categorias(), main() (+1 more)

### Community 52 - "dialog.tsx"
Cohesion: 0.29
Nodes (14): AlertModalProps, CommandDialog(), Dialog(), DialogContent(), DialogDescription(), DialogFooter(), DialogHeader(), DialogOverlay() (+6 more)

### Community 53 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 54 - "astro-basic-auth/package.json"
Cohesion: 0.15
Nodes (13): dependencies, astro@^5.0.0, @astrojs/node@^9.0.0, @clerk/astro@^2.0.0, name, scripts, build, dev (+5 more)

### Community 55 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, allowJs, baseUrl, esModuleInterop, forceConsistentCasingInFileNames, isolatedModules, jsx, lib (+9 more)

### Community 56 - "ai_estimator.py"
Cohesion: 0.15
Nodes (5): actualizar_dimensiones_en_bd(), cargar_saldo_openai(), guardar_saldo_openai(), obtener_dimensiones_lote(), obtener_dimensiones_producto()

### Community 57 - "components.json"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 58 - "nextjs-basic-auth/package.json"
Cohesion: 0.15
Nodes (16): dependencies, @clerk/nextjs@latest, next@latest, react@latest, react-dom@latest, next, react, name (+8 more)

### Community 60 - "logger.py"
Cohesion: 0.14
Nodes (4): inicializar_sistema_logs(), _manejador_excepciones_no_controladas(), registrar_info(), StderrTee

### Community 61 - "orders-table/index.tsx"
Cohesion: 0.21
Nodes (11): metadata, OrdersPage(), PageProps, ordersQueryOptions(), OrderListingPage(), columns, columnIds, OrdersTable() (+3 more)

### Community 62 - "@base-ui/react"
Cohesion: 0.18
Nodes (9): @base-ui/react@^1.6.0, class-variance-authority@^0.7.1, @base-ui/react, class-variance-authority, HoverCardContent(), ToggleGroupContext, ToggleGroupItem(), Toggle() (+1 more)

### Community 63 - "users-table/index.tsx"
Cohesion: 0.22
Nodes (10): metadata, PageProps, UsersPage(), usersQueryOptions(), UserFormSheetTrigger(), UserListingPage(), columns, columnIds (+2 more)

### Community 64 - "drawer.tsx"
Cohesion: 0.17
Nodes (11): DrawerContent(), DrawerContext, DrawerContextProps, DrawerDescription(), DrawerFooter(), DrawerHeader(), DrawerOverlay(), DrawerPortal() (+3 more)

### Community 65 - "@react-router/dev"
Cohesion: 0.15
Nodes (7): devDependencies, @react-router/dev@^8.0.0, @react-router/node@^8.0.0, vite@^8.0.0, vite, @react-router/dev, @react-router/node

### Community 66 - "json"
Cohesion: 0.24
Nodes (5): main(), main(), generate_markdown_report(), main(), scan_codebase()

### Community 67 - "scripts"
Cohesion: 0.14
Nodes (14): scripts, build, cleanup, dev, format, format:check, lint, lint:fix (+6 more)

### Community 68 - "scraper-process.ts"
Cohesion: 0.19
Nodes (10): dynamic, getScraperHost(), POST(), dynamic, getScraperHost(), POST(), globalForScraper, ScraperEvent (+2 more)

### Community 69 - "migrate/route.ts"
Cohesion: 0.27
Nodes (10): syncAllImages(), execAsync, getScraperHost(), POST(), SUPABASE_URL, toSlug(), ensureProductsBucketExists(), PRODUCTS_BUCKET (+2 more)

### Community 70 - "recent-sales.tsx"
Cohesion: 0.23
Nodes (8): AreaStats(), BarStats(), Sales(), delay(), fakeProducts, Product, RecentSales(), salesData

### Community 71 - "carousel.tsx"
Cohesion: 0.19
Nodes (13): Carousel(), CarouselApi, CarouselContent(), CarouselContext, CarouselContextProps, CarouselItem(), CarouselNext(), CarouselOptions (+5 more)

### Community 72 - "toast.tsx"
Cohesion: 0.26
Nodes (13): toast, Toast(), ToastAction(), ToastClose(), ToastContent(), ToastDescription(), Toaster(), ToastIcon() (+5 more)

### Community 73 - "FUNDING.yml"
Cohesion: 0.15
Nodes (12): buy_me_a_coffee, community_bridge, custom, github, issuehunt, ko_fi, lfx_crowdfunding, liberapay (+4 more)

### Community 74 - ".oxfmtrc.json"
Cohesion: 0.15
Nodes (12): arrowParens, bracketSpacing, endOfLine, experimentalSortTailwindcss, ignorePatterns, jsxSingleQuote, $schema, semi (+4 more)

### Community 75 - "demo-form.tsx"
Cohesion: 0.21
Nodes (10): metadata, Page(), countryOptions, DemoForm(), demoFormSchema, DemoFormValues, frameworkOptions, genderOptions (+2 more)

### Community 77 - "20260925_products_and_variants_schema.sql"
Cohesion: 0.33
Nodes (11): idx_products_category, idx_products_featured, idx_products_sku, idx_products_status, idx_variants_product, idx_variants_sku, public.categories, public.product_variants (+3 more)

### Community 78 - "nuxt-basic-auth/package.json"
Cohesion: 0.22
Nodes (10): dependencies, @clerk/nuxt@latest, nuxt@latest, name, private, scripts, build, dev (+2 more)

### Community 79 - "@tabler/icons-react"
Cohesion: 0.22
Nodes (9): @tabler/icons-react@^3.40.0, @tabler/icons-react, Pagination(), PaginationContent(), PaginationEllipsis(), PaginationLink(), PaginationLinkProps, PaginationNext() (+1 more)

### Community 80 - "ref_path"
Cohesion: 0.24
Nodes (6): main(), copyRecursive(), srcDir, dynamic, GET(), getScraperHost()

### Community 81 - "breadcrumbs.tsx"
Cohesion: 0.42
Nodes (9): Breadcrumbs(), Breadcrumb(), BreadcrumbEllipsis(), BreadcrumbItem(), BreadcrumbLink(), BreadcrumbList(), BreadcrumbPage(), BreadcrumbSeparator() (+1 more)

### Community 82 - "main.tsx"
Cohesion: 0.24
Nodes (7): dependencies, @clerk/react@^5.0.0, react@^19.0.0, react-dom@^19.0.0, react, App(), @clerk/react

### Community 83 - "compilerOptions"
Cohesion: 0.20
Nodes (9): compilerOptions, esModuleInterop, jsx, module, moduleResolution, skipLibCheck, strict, target (+1 more)

### Community 84 - "router.tsx"
Cohesion: 0.20
Nodes (5): @tanstack/react-router@latest, Register, @tanstack/react-router, Route, @tanstack/react-router

### Community 85 - "interface"
Cohesion: 0.22
Nodes (5): interface, display_name, icon_large, icon_small, short_description

### Community 86 - "image/route.ts"
Cohesion: 0.28
Nodes (6): dynamic, fetchRemoteImage(), GET(), getScraperHost(), httpsAgent, SVG_FALLBACK

### Community 87 - "sonner"
Cohesion: 0.31
Nodes (7): sonner, CoronelScraperPage(), DbStats, ScraperStatusData, StockSyncRecord, CatalogResetDialog(), CatalogResetDialogProps

### Community 88 - "advanced-form-patterns.tsx"
Cohesion: 0.28
Nodes (7): metadata, Page(), AdvancedFormPatterns(), AdvancedFormValues, advancedSchema, countryOptions, countryStateMap

### Community 89 - "20260926_create_orders_tables.sql"
Cohesion: 0.46
Nodes (7): idx_order_items_order_id, idx_orders_customer_name, idx_orders_order_number, idx_orders_order_status, idx_orders_order_type, public.order_items, public.orders

### Community 90 - "compilerOptions"
Cohesion: 0.29
Nodes (6): compilerOptions, jsx, lib, moduleResolution, strict, target

### Community 91 - "run-remote-migrations.ts"
Cohesion: 0.48
Nodes (5): executeSql(), getHierarchyForProduct(), main(), verifyEndpoint(), INITIAL_PRODUCTS

### Community 92 - "scraper/products/margins/route.ts"
Cohesion: 0.53
Nodes (4): execAsync, getPythonBin(), getScraperHost(), POST()

### Community 93 - "reset/route.ts"
Cohesion: 0.53
Nodes (5): BASE_URL, execAsync, getScraperHost(), POST(), resetLocalCatalogMemory()

### Community 94 - "scraper/products/route.ts"
Cohesion: 0.73
Nodes (5): DELETE(), execAsync, GET(), getPythonBin(), getScraperHost()

### Community 95 - "overrides"
Cohesion: 0.40
Nodes (5): overrides, postcss, sharp, @types/react, @types/react-dom

### Community 98 - "cron/route.ts"
Cohesion: 0.60
Nodes (4): dynamic, GET(), getScraperHost(), POST()

### Community 99 - "scraper/products/stock/route.ts"
Cohesion: 0.70
Nodes (4): execAsync, getPythonBin(), getScraperHost(), POST()

### Community 100 - "stream/route.ts"
Cohesion: 0.60
Nodes (4): dynamic, GET(), getScraperHost(), POST()

### Community 101 - "20260917_create_products_table.sql"
Cohesion: 0.70
Nodes (4): idx_products_category, idx_products_featured, idx_products_sku, public.products

### Community 103 - "IconsViewPage"
Cohesion: 0.67
Nodes (3): metadata, page(), IconsViewPage()

### Community 104 - "[[...profile]]/page.tsx"
Cohesion: 0.67
Nodes (3): metadata, Page(), ProfileViewPage()

## Knowledge Gaps
- **2 isolated node(s):** `astro/tsconfigs/strict`, `scraping-coronel`
  These have ≤1 connection - possible missing edges. (Counts symbols only; 721 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **51 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `sidebar.tsx`, `infobar.tsx`, `form.ts`, `ref_react`, `data-table-faceted-filter.tsx`, `kanban.tsx`, `conversation-list.tsx`, `src/app/layout.tsx`, `utils.ts`, `Badge`, `Card`, `PageContainer`, `Button`, `combobox.tsx`, `notifications-page.tsx`, `sheet-form-demo.tsx`, `sign-in-view.tsx`, `data-table.tsx`, `file-uploader.tsx`, `product-tables/index.tsx`, `dialog.tsx`, `orders-table/index.tsx`, `@base-ui/react`, `drawer.tsx`, `carousel.tsx`, `toast.tsx`, `@tabler/icons-react`, `breadcrumbs.tsx`?**
  _High betweenness centrality (0.151) - this node is a cross-community bridge._
- **What connects `astro/tsconfigs/strict`, `scraping-coronel` to the rest of the system?**
  _2 weakly-connected nodes found - possible missing edges._
- **Should `sidebar.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07039199332777314 - nodes in this community are weakly interconnected._
- **Why does `Button()` connect `Button` to `sidebar.tsx`, `cn`, `infobar.tsx`, `form.ts`, `ref_react`, `data-table-faceted-filter.tsx`, `kanban.tsx`, `conversation-list.tsx`, `utils.ts`, `order-detail-sheet.tsx`, `Badge`, `PageContainer`, `combobox.tsx`, `notifications-page.tsx`, `sheet-form-demo.tsx`, `multi-step-product-form.tsx`, `file-uploader.tsx`, `dialog.tsx`, `users-table/index.tsx`, `carousel.tsx`, `toast.tsx`, `demo-form.tsx`, `@tabler/icons-react`, `advanced-form-patterns.tsx`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Should `cn` be split into smaller, more focused modules?**
  _Cohesion score 0.03870162297128589 - nodes in this community are weakly interconnected._
- **Why does `react-dom` connect `nextjs-basic-auth/package.json` to `react-basic-auth/package.json`, `chrome-ext-basic-auth/package.json`, `package.json`, `main.tsx`, `tanstack-basic-auth/package.json`, `react-router-basic-auth/package.json`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Should `infobar.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05393000573723465 - nodes in this community are weakly interconnected._