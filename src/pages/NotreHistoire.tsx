export function NotreHistoire() {
  return (
    <div className="py-24 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-light mb-12 text-center">
          Notre histoire
        </h1>

        <div className="flex flex-col items-center mb-12">
          <img
            src="/nath.jpg"
            alt="Nia, fondatrice de l'ArtPéro"
            className="w-full max-w-md rounded-lg shadow-lg object-cover"
          />
        </div>

        <div className="space-y-8 text-lg leading-relaxed text-black/80">
          <p>
            Derrière L'ArtPéro, il y a moi, Nia, une amoureuse des gens, de la créativité… et des apéros qui rassemblent 🍸
          </p>

          <p>
            Depuis plus de dix ans, j'organise des événements pour créer du lien, faire vibrer, inspirer.
            <br />
            Mais j'avais envie d'aller plus loin.
          </p>

          <p>
            Envie de moments vrais, où l'on se rencontre autrement autour d'un verre, d'une œuvre, d'une idée, d'une émotion.
          </p>

          <p>
            C'est comme ça qu'est né l'ArtPéro, un concept de soirées où l'art devient un prétexte à la rencontre.
            <br />
            Peinture, musique, gastronomie, danse, mode, écriture…
            <br />
            Chaque thème ouvre une nouvelle porte vers la découverte des autres, et un peu de soi aussi.
          </p>

          <p>
            L'ArtPéro, c'est plus qu'un apéro.
            <br />
            C'est une expérience humaine et artistique, un lieu où l'on vient curieux, et d'où l'on repart inspiré.
          </p>

          <div className="h-px bg-black/10 my-12" />

          <p className="text-center font-medium">
            Et ce n'est que le début…
          </p>

          <div className="bg-gray-200 border border-gray-300 rounded-lg p-6 shadow-sm">
            <p className="text-center italic text-gray-700">
              Bientôt, l'aventure prendra la forme d'un club de rencontres artistiques, pour celles et ceux qui aiment la beauté, les échanges sincères et les vibes positives
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
