import { test, expect } from "@playwright/test";
test("searches and combines URL filters with honest empty results", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Seu futuro começa",
  );
  await page
    .getByRole("textbox", { name: "O que você procura?" })
    .fill("Tecnologia");
  await page.getByLabel("Onde?").fill("Aracaju");
  await page.getByRole("button", { name: "Buscar oportunidades" }).click();
  await expect(page).toHaveURL(/q=Tecnologia.*city=Aracaju/);
  await page
    .getByRole("combobox", { name: "Modalidade", exact: true })
    .selectOption("remoto");
  await page
    .getByRole("combobox", { name: "Experiência", exact: true })
    .selectOption("nao");
  await page.getByRole("button", { name: "Buscar oportunidades" }).click();
  await expect(page).toHaveURL(/modality=remoto/);
  await expect(page).toHaveURL(/experience=nao/);
  await expect(page.getByText("0 oportunidades encontradas")).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Uma boa oportunidade merece ser conferida.",
    }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Limpar filtros" }).click();
  await expect(page).toHaveURL(/\/oportunidades$/);
});
test("protects private routes and refuses fake authentication", async ({
  page,
}) => {
  for (const path of [
    "/painel",
    "/empresa/vagas/nova",
    "/admin",
    "/admin/usuarios",
  ]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/entrar/);
  }
  await page.goto("/cadastro");
  await expect(
    page.getByRole("button", { name: "Criar minha conta" }),
  ).toBeDisabled();
  await expect(page.getByText(/Contas ainda indisponíveis/)).toBeVisible();
});
test("navigates educational and legal pages", async ({ page }) => {
  for (const path of [
    "/cursos",
    "/jovem-aprendiz",
    "/estagios",
    "/primeiro-emprego",
    "/seguranca",
    "/privacidade",
    "/termos",
    "/acessibilidade",
    "/guia-curriculo",
    "/guia-entrevista",
  ]) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  }
});
test("keyboard skip link and layout work without horizontal overflow", async ({
  page,
}) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Pular para o conteúdo" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.goto("/oportunidades");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
test("returns real 404 and security headers", async ({ request }) => {
  const response = await request.get("/oportunidades/nao-existe");
  expect(response.status()).toBe(404);
  expect(response.headers()["content-security-policy"]).toContain(
    "frame-ancestors 'none'",
  );
  expect(response.headers()["x-content-type-options"]).toBe("nosniff");
});

test("captures the landing layout", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath("home.png"),
    fullPage: true,
  });
});

test("has no detected WCAG A/AA violations on public entry points", async ({
  page,
}) => {
  const { default: AxeBuilder } = await import("@axe-core/playwright");
  for (const path of ["/", "/oportunidades", "/cadastro"]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(
      results.violations,
      JSON.stringify(
        results.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => n.target),
        })),
      ),
    ).toEqual([]);
  }
});
