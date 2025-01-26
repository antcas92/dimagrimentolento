document.addEventListener('DOMContentLoaded', function() {
  // Variabili e costanti
 // const basePath = './assets/testimonianze_fb/';
  const basePath = './assets/images/ig/';
  const photosPerPage = 4;
  const videosPerPage = 6;
  let currentPhotoPage = 0;
  let currentVideoPage = 0;

  const filterPhotos = document.getElementById('filter-photos');
  const loadMorePhotosButton = document.getElementById('loadMorePhotos');
  const facebookContainer = document.getElementById('facebook');
  const filterVideos = document.getElementById('filter-videos');
  const loadMoreVideosButton = document.getElementById('loadMoreVideos');
  const testimonialsContainer = document.getElementById('testimonials');
  
  const imagePaths = [
    { path: basePath + '2024_ig_1.webp', category: '2024' },
    { path: basePath + '2024_ig_2.webp', category: '2024' },
    { path: basePath + '2024_ig_3.webp', category: '2024' },
    { path: basePath + '2024_ig_4.webp', category: '2024' },
    { path: basePath + '2024_ig_5.webp', category: '2024' },
    { path: basePath + '2024_ig_6.webp', category: '2024' },
    { path: basePath + '2024_ig_7.webp', category: '2024' },
    { path: basePath + '2024_ig_8.webp', category: '2024' },
    { path: basePath + '2024_ig_9.webp', category: '2024' },
    { path: basePath + '2024_ig_11.webp', category: '2024' },
    { path: basePath + '2023_ig_1.webp', category: '2023' },
    { path: basePath + '2023_ig_2.webp', category: '2023' },
    { path: basePath + '2023_ig_3.webp', category: '2023' },
    { path: basePath + '2023_ig_4.webp', category: '2023' },
    { path: basePath + '2022_ig_1.webp', category: '2022' },
    { path: basePath + '2022_ig_2.webp', category: '2022' },
    { path: basePath + '2022_ig_3.webp', category: '2022' },
    { path: basePath + '2022_ig_4.webp', category: '2022' },
    { path: basePath + '2022_ig_5.webp', category: '2022' },
    { path: basePath + '2022_ig_6.webp', category: '2022' },
    { path: basePath + '2022_ig_7.webp', category: '2022' }
  ];

  const testimonials = [
    {
      videoid: '2wZr_8FOoNM',
      category: '2024',
      name: '"Ho sconfitto gli attacchi di fame che mi facevano riprendere tutto il peso perso"',
      description: 'Scopri la storia di Rosita',
      link: 'Ho-sconfitto-gli-attacchi-di-fame-che-mi-facevano-riprendere-tutto-il-peso-perso'
    },
    {
      videoid: 'wmaFgW0wJ64',
      category: '2024',
      name: '"A 31 anni ho scoperto che i carboidrati non fanno ingrassare: la mia rivoluzione dopo 14 anni"',
      description: 'Scopri la storia di Chiara',
      link: 'a-31-anni-ho-scoperto-che-carboidrati-non-fanno-ingrassare'
    },
    {
      videoid: 'WIqKbnbXirc',
      category: '2024',
      name: '"Ho scoperto che non era fame vera, ma ansia: ora so come gestirla senza il cibo"',
      description: 'Scopri la storia di Giovanna',
      link: 'ho-scoperto-che-non-era-fame-vera-ma-ansia'
    },
    {
      videoid: 'LeZBnmsBLM8',
      category: '2024',
      name: '"Ho smesso di essere vittima delle diete: ora so gestire il mio rapporto col cibo"',
      description: 'Scopri la storia di Daniela',
      link: 'ho-smesso-di-essere-vittima-delle-diete'
    },
    {
      videoid: 'XLNmtank2D0',
      category: '2024',
      name: '"Ho smesso di chiamarle diete: finalmente ho imparato a mangiare"',
      description: 'Scopri la storia di Stefania',
      link: 'Ho-smesso-di-chiamarle-diete-finalmente-ho-imparato-a-mangiare'
    },
    {
      videoid: 'FRuyAC76T_o',
      category: '2024',
      name: '"A 67 anni ho smesso di credere alle diete drastiche: il cambiamento arriva con la calma"',
      description: 'Scopri la storia di Olimpia',
      link: 'a-67-anni-ho-smesso-di-credere-alle-diete-drastiche'
    },
    {
      videoid: 'mg0BiI8kVSM',
      category: '2023',
      name: '"Non è una dieta drastica: finalmente ho trovato un metodo che rispetta i miei tempi"',
      description: '',
      link: 'non-e-una-dieta-drastica-metodo-rispetta-i-tempi'
    },
    {
      videoid: 'dJJaxyO6fSs',
      category: '2023',
      name: '“Ho imparato come smettere di mangiare per noia e stress”',
      description: '',
      link: 'ho-imparato-come-smettere-di-mangiare-per-noia-e-stress'
    },
    {
      videoid: 'FZm7w6Nd_-4',
      category: '2022',
      name: '"Prima mi stancavo dopo due mesi di dieta, ora ho trovato gli stimoli giusti per continuare"',
      description: '',
      link: 'prima-mi-stancavo-dopo-due-mesi-di-dieta'
    },
    {
      videoid: 'Z4HgI07oNYM',
      category: '2022',
      name: '“Non è una dieta mordi e fuggi, ti cambia per tutta la vita”',
      description: '',
      link: 'non-e-una-dieta-mordi-e-fuggi'
    },
    {
      videoid: 'gwAaQxLGLqA',
      category: '2021',
      name: '"A 17 anni ho deciso di prendermi cura di me stessa, senza più paura di fallire"',
      description: '',
      link: 'a-17-anni-ho-deciso-di-prendermi-cura-di-me-stessa'
    },
    {
      videoid: 'JGCuItKy-54',
      category: '2021',
      name: '"È cambiato completamente il mio approccio all’alimentazione"',
      description: '',
      link: 'e-cambiato-completamente-il-mio-approccio-all-alimentazione'
    }
  ];
  
  // Funzione per mostrare le foto in base al filtro
  function showPhotos(filterValue, page = 0) {
    const start = page * photosPerPage;
    const end = start + photosPerPage;
    facebookContainer.innerHTML = ''; // Svuota il contenitore delle foto
    const filteredPhotos = imagePaths.filter(image => filterValue === 'all' || image.category === filterValue);

    filteredPhotos.slice(0, end).forEach(image => {
      const div = document.createElement('div');
      div.className = 'w-full h-auto';

      const img = document.createElement('img');
      img.src = image.path;
      img.alt = 'Testimonianza';
      img.className = 'w-full h-auto object-cover';

      div.appendChild(img);
      facebookContainer.appendChild(div);
    });

    if (end >= filteredPhotos.length) {
      loadMorePhotosButton.style.display = 'none';
    } else {
      loadMorePhotosButton.style.display = 'block';
    }
  }

  // Funzione per mostrare i video in base al filtro
  function showTestimonials(filterValue, page = 0) {
    const start = page * videosPerPage;
    const end = start + videosPerPage;
    testimonialsContainer.innerHTML = '';
    const filteredTestimonials = testimonials.filter(testimonial => 
        filterValue === 'all' || testimonial.category === filterValue
    );

    filteredTestimonials.slice(0, end).forEach(testimonial => {
        const div = document.createElement('article'); // Cambio da div a article per migliore semantica
        div.className = 'w-full sm:w-1/2 lg:w-1/3 p-4';
        div.setAttribute('data-weight', testimonial.category);

        div.innerHTML = `
            <div class="bg-white rounded-xl shadow-lg overflow-hidden h-full flex flex-col">
                <!-- Schema.org markup -->
                <script type="application/ld+json">
                {
                    "@context": "https://schema.org",
                    "@type": "VideoObject",
                    "name": "${testimonial.name}",
                    "description": "${testimonial.description || 'Videotestimonianza Dimagrimento Lento'}",
                    "thumbnailUrl": "https://img.youtube.com/vi/${testimonial.videoid}/maxresdefault.jpg",
                    "uploadDate": "${testimonial.category}-01-01",
                    "embedUrl": "https://www.youtube.com/embed/${testimonial.videoid}"
                }
                </script>

                <div class="video-container" role="presentation">
                    <lite-youtube 
                        videoid="${testimonial.videoid}"
                        style="width: 100%;"
                        title="${testimonial.name} - Videotestimonianza Dimagrimento Lento"
                        params="rel=0"
                    ></lite-youtube>
                </div>
                
                <div class="p-4 flex flex-col flex-grow">
                    <header class="flex-grow">
                        <h2 class="text-gray-700 text-lg font-medium mb-2">
                            ${testimonial.name}
                        </h2>
                    
                    </header>

                    ${testimonial.description ? `
                        <footer class="mt-3">
                            <a href="/videotestimonianze/${testimonial.category}/${testimonial.link}.html" 
                               class="inline-block w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 
                                      text-white text-center rounded-lg transition-colors"
                               aria-label="Scopri la storia completa di ${testimonial.name}"
                               title="Leggi la storia completa di ${testimonial.name}">
                                ${testimonial.description}
                            </a>
                        </footer>
                    ` : ''}
                </div>
            </div>
        `;

        testimonialsContainer.appendChild(div);
    });

    // Aggiunta di aria-label per accessibilità
    if (end >= filteredTestimonials.length) {
        loadMoreVideosButton.style.display = 'none';
    } else {
        loadMoreVideosButton.style.display = 'block';
        loadMoreVideosButton.setAttribute('aria-label', 'Carica altre videotestimonianze');
    }
}




  // Mostra tutte le foto e i video all'inizio
  showPhotos('all');
  showTestimonials('all');

  // Event listener per il filtro delle foto
  filterPhotos.addEventListener('change', function() {
    currentPhotoPage = 0;
    showPhotos(this.value);
  });

  // Event listener per il filtro dei video
  filterVideos.addEventListener('change', function() {
    currentVideoPage = 0;
    showTestimonials(this.value);
  });

  // Event listener per il pulsante "Mostra altri" delle foto
  loadMorePhotosButton.addEventListener('click', function() {
    currentPhotoPage++;
    showPhotos(filterPhotos.value, currentPhotoPage);
  });

  // Event listener per il pulsante "Mostra altri" dei video
  loadMoreVideosButton.addEventListener('click', function() {
    currentVideoPage++;
    showTestimonials(filterVideos.value, currentVideoPage);
  });

  //For contattaci button:
  document.getElementById('contactButton').addEventListener('click', function() {
    document.getElementById('comeHere').scrollIntoView({ behavior: 'smooth' });
    this.style.opacity = 0; // Usa 'opacity: 0' se vuoi un effetto più graduale
  });
    // Aggiungere animazione allo scroll
    document.addEventListener('scroll', function() {
      const buttonContainer = document.getElementById('contactButtonContainer');
      if (!buttonContainer.classList.contains('slide-in')) {
        buttonContainer.classList.add('slide-in');
        buttonContainer.style.transform = 'translateY(0)';
      }
    });
  
});



