<template>
  <div class="flex min-h-dvh flex-col">
    <ReadingProgress />
    <SiteHeader />
    <main class="mx-auto w-full max-w-(--container-site) flex-1 px-5 pt-10 pb-20 sm:px-8 lg:pt-14">
      <slot />
    </main>
    <SiteFooter />
    <BackToTop />
  </div>
</template>
