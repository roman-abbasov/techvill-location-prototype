const tools = [
  {
    id: 'notion',
    title: 'Notion',
    description: 'Использовался для первоначальной структуры решения: фиксации идей, разбора кейса, формулировки сути решения и гипотез по работе функционала как такового.',
  },
  {
    id: 'codex',
    title: 'GPT Codex',
    description: 'Вайбкодинг в чистом виде! Использовался как вспомогательный инструмент для вёрстки HTML-страницы, подготовки кода диаграмм и интеграции Яндекс.Карты API, чтобы представить решение в удобном для чтения виде.',
  },
  {
    id: 'yandex',
    title: 'Яндекс.Карты API',
    description: 'Как один из самых простых и доступных источников для интеграции реальной карты в прототип.',
  },
  {
    id: 'design',
    title: 'Оформление',
    description: 'Изучил сайт techvill.ru и визуально разобрал его на составляющие (цвета, шрифты, иконографику, стиль карточек и кнопок), чтобы оформление прототипа было согласовано с фирменным стилем, а не выглядело как generic-интерфейс.',
  },
];

const articles = [
  {
    title: 'Кейс М.Видео-Эльдорадо про ML для выбора локаций',
    href: 'https://vc.ru/mvideoeldorado/129503-ekspansiya-na-mashinnom-obuchenii-otkryvaem-magaziny-v-luchshih-lokaciyah-i-razvivaem-onlayn',
    description: 'Реальный пример того, как крупная российская сеть считает трафик, каннибализацию и прогноз оборота — помог понять, какие данные вообще используются на практике.',
  },
  {
    title: 'Геоаналитика для выбора локации магазина (Билайн)',
    href: 'https://bigdata.beeline.ru/blog/articles/vybor-lokacii-magazina',
    description: 'Объясняет, как тепловые карты и данные о трафике используются ритейлерами для выбора места под магазин.',
  },
  {
    title: 'Как геоаналитика помогает искать места для точек, модель Хаффа',
    href: 'https://geointellect.com/kak-geoanalitika-pomogaet-iskat-mesta-dlya-torgovyh-tochek/',
    description: 'Отсюда я взял понимание, как классически считают распределение трафика между несколькими точками поблизости.',
  },
  {
    title: 'Что такое каннибализация рынка и как её избегать',
    href: 'https://priceva.ru/blog/article/chto-takoe-kannibalizatsiya-rynka-vidy-i-sposoby-predotvrashheniya',
    description: 'Базовое объяснение эффекта каннибализации в ритейле — пригодилось, чтобы точнее сформулировать этот риск в разделе 9.',
  },
];

export default function ToolsAndKnowledgePage() {
  return (
    <div className="tools-page" id="panel-Использованные инструменты и знания" role="tabpanel">
      <header className="tools-intro">
        <p className="eyebrow">Как готовилось решение</p>
        <h1>Использованные инструменты и знания</h1>
        <p>При выполнении тестового задания я использовал несколько инструментов для структурирования решения и построения удобного представления результата в формате страницы. Ниже перечислены основные сервисы и их роль в подготовке итогового материала.</p>
      </header>

      <div className="tools-grid">
        {tools.map((tool) => (
          <article className={`tool-card tool-card-${tool.id}`} key={tool.id}>
            <h2>{tool.title}</h2>
            <p>{tool.description}</p>
          </article>
        ))}

        <article className="tool-card articles-card">
          <h2>Внешние статьи</h2>
          <p>Тема на стыке ритейла и геоаналитики была мне не до конца знакома, поэтому перед тем как писать решение, разобрался в нескольких материалах:</p>
          <ul className="article-list">
            {articles.map((article) => (
              <li key={article.href}>
                <a href={article.href} target="_blank" rel="noreferrer">{article.title}</a>
                <p>{article.description}</p>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </div>
  );
}
