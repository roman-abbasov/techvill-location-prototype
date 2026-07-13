const disclaimer = 'Это концептуальное решение, основанное на моём общем понимании ритейла, изученных открытых источниках и экспертизе в качестве менеджера проектов. Я не располагаю внутренней информацией о том, какие данные, системы и процессы использует Техвилл на практике, как распределены зоны ответственности между отделами. Предложенный мною подход стоит воспринимать как гипотезу, которую нужно уточнять и корректировать вместе с командой на старте проекта.';

export default function Disclaimer() {
  return (
    <aside className="concept-disclaimer" aria-labelledby="concept-disclaimer-title">
      <span className="disclaimer-mark" aria-hidden="true">i</span>
      <div>
        <h2 id="concept-disclaimer-title">Важно о концепции</h2>
        <p>{disclaimer}</p>
      </div>
    </aside>
  );
}
