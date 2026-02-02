export function Experience() {
  const etapes = [
    {
      number: '01',
      title: 'Découverte',
      description: 'Un premier entretien pour comprendre qui vous êtes, vos aspirations et vos valeurs.',
    },
    {
      number: '02',
      title: 'Écoute',
      description: 'Des échanges approfondis pour cerner votre personnalité et ce que vous recherchez vraiment.',
    },
    {
      number: '03',
      title: 'Accompagnement',
      description: 'Un coaching personnalisé pour révéler la meilleure version de vous-même.',
    },
    {
      number: '04',
      title: 'Rencontre',
      description: 'Des mises en relation réfléchies, avec des personnes qui vous correspondent vraiment.',
    },
    {
      number: '05',
      title: 'Suivi',
      description: 'Un accompagnement continu, avec bienveillance et discrétion, tout au long de votre parcours.',
    },
  ];

  return (
    <div className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-light mb-12 text-center">
          L'expérience que nous proposons
        </h1>

        <div className="space-y-8 text-lg leading-relaxed text-black/80 mb-16">
          <p className="text-center">
            Votre parcours avec nous est pensé comme un cheminement intime et élégant :
            découverte de vos aspirations, entretiens personnalisés, accompagnement sur
            mesure et mises en relation réfléchies. Nous veillons à ce que chaque étape
            soit respectueuse de votre rythme et de votre authenticité.
          </p>
        </div>

        <div className="space-y-12">
          {etapes.map((etape) => (
            <div key={etape.number} className="flex gap-8">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 border border-black flex items-center justify-center">
                  <span className="text-xl font-light">{etape.number}</span>
                </div>
              </div>
              <div className="flex-1 pt-2">
                <h2 className="text-2xl font-light mb-3">{etape.title}</h2>
                <p className="text-black/70">{etape.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 p-12 bg-black text-white">
          <p className="text-center text-lg">
            Chaque étape est conçue pour vous permettre de vous découvrir, de gagner
            en confiance et d'aborder la rencontre avec sérénité et authenticité.
          </p>
        </div>
      </div>
    </div>
  );
}
