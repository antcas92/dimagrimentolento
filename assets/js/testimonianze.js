document.addEventListener('DOMContentLoaded', function() {
  // Variabili e costanti
  const basePath = './assets/testimonianze_fb/';
  const photosPerPage = 4;
  const videosPerPage = 3;
  let currentPhotoPage = 0;
  let currentVideoPage = 0;

  const filterPhotos = document.getElementById('filter-photos');
  const loadMorePhotosButton = document.getElementById('loadMorePhotos');
  const facebookContainer = document.getElementById('facebook');
  const filterVideos = document.getElementById('filter-videos');
  const loadMoreVideosButton = document.getElementById('loadMoreVideos');
  const testimonialsContainer = document.getElementById('testimonials');
  
  const imagePaths = [
    { path: basePath + '2023_1.png', category: '2024' },
    { path: basePath + '2023_2.png', category: '2024' },
    { path: basePath + '2023_3.png', category: '2024' },
    { path: basePath + '2023_4.png', category: '2024' },
    { path: basePath + '2023_5.png', category: '2024' },
    { path: basePath + '2023_6.png', category: '2024' },
    { path: basePath + '2023_7.png', category: '2024' },
    { path: basePath + '2023_8.png', category: '2024' },
    { path: basePath + '2023_9.png', category: '2024' },
    { path: basePath + 'testimonianza_1.png', category: 'testimonianza' },
    { path: basePath + 'testimonianza_2.png', category: '2023' },
    { path: basePath + 'testimonianza_3.png', category: '2023' },
    { path: basePath + 'testimonianza_4.png', category: '2023' },
    { path: basePath + 'testimonianza_5.png', category: '2023' },
    { path: basePath + 'testimonianza_6.png', category: '2023' },
    { path: basePath + 'testimonianza_7.png', category: '2023' },
    { path: basePath + 'testimonianza_8.png', category: '2023' },
    { path: basePath + 'testimonianza_9.png', category: '2023' },
    { path: basePath + 'testimonianza_10.png', category: '2023' },
    { path: basePath + 'testimonianza_11.png', category: '2023' },
    { path: basePath + 'testimonianza_12.png', category: '2023' },
    { path: basePath + 'testimonianza_13.png', category: '2023' },
    { path: basePath + 'testimonianza_14.png', category: '2023' },
    { path: basePath + 'testimonianza_15.png', category: '2023' },
    { path: basePath + 'testimonianza_16.png', category: '2023' },
    { path: basePath + 'testimonianza_17.png', category: '2023' },
    { path: basePath + 'testimonianza_18.png', category: '2023' },
    { path: basePath + 'testimonianza_19.png', category: '2023' },
    { path: basePath + 'testimonianza_20.png', category: '2023' },
    { path: basePath + 'testimonianza_21.png', category: '2023' },
    { path: basePath + 'testimonianza_22.png', category: '2023' },
    // Aggiungi altri percorsi se necessario
  ];

  const testimonials = [
    { videoid: 'vU9QzdcLi10', category: '2024', name: 'Non è solo dieta: è un nuovo modo di vivere che ti cambia per sempre', description: ''},
    { videoid: 'WIqKbnbXirc', category: '2024', name: '"Ho scoperto che non era fame vera, ma ansia: ora so come gestirla senza il cibo"', description: ''},
    { videoid: 'LeZBnmsBLM8', category: '2024', name: '"Ho smesso di essere vittima delle diete: ora so gestire il mio rapporto col cibo"', description: ''},
    { videoid: 'FRuyAC76T_o', category: '2024', name: '"A 67 anni ho smesso di credere alle diete drastiche: il cambiamento arriva con la calma"', description: ''},
    { videoid: 'mg0BiI8kVSM', category: '2023', name: '"Non è una dieta drastica: finalmente ho trovato un metodo che rispetta i miei tempi"', description: ''},
    { videoid: 'dJJaxyO6fSs', category: '2023', name: '“Ho imparato come smettere di mangiare per noia e stress”', description: '' },
    { videoid: 'FZm7w6Nd_-4', category: '2022', name: '"Prima mi stancavo dopo due mesi di dieta, ora ho trovato gli stimoli giusti per continuare"', description: '' },
    { videoid: 'Z4HgI07oNYM', category: '2022', name: '“Non è una dieta mordi e fuggi, ti cambia per tutta la vita”', description: '' },
    { videoid: 'gwAaQxLGLqA', category: '2021', name: '"A 17 anni ho deciso di prendermi cura di me stessa, senza più paura di fallire"', description: '' },
    { videoid: 'JGCuItKy-54', category: '2021', name: '"È cambiato completamente il mio approccio all’alimentazione"', description: '' },
    // Aggiungi altri video se necessario
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
    testimonialsContainer.innerHTML = ''; // Svuota il contenitore dei video
    const filteredTestimonials = testimonials.filter(testimonial => filterValue === 'all' || testimonial.category === filterValue);

    filteredTestimonials.slice(0, end).forEach(testimonial => {
      const div = document.createElement('div');
      div.className = 'w-full sm:w-1/3 p-6 testimonial';
      div.setAttribute('data-weight', testimonial.category);

      const liteYouTube = document.createElement('lite-youtube');
      liteYouTube.setAttribute('style', 'width: 100%;');
      liteYouTube.setAttribute('videoid', testimonial.videoid);
      //liteYouTube.setAttribute('params', 'start=6');
      
      const p = document.createElement('p');
      p.className = 'text-gray-800 pt-3';
      p.innerHTML = `<span class="text-gray-500 text-xl">${testimonial.name} ${testimonial.description}</span>`;

      div.appendChild(liteYouTube);
      div.appendChild(p);
      testimonialsContainer.appendChild(div);
    });

    if (end >= filteredTestimonials.length) {
      loadMoreVideosButton.style.display = 'none';
    } else {
      loadMoreVideosButton.style.display = 'block';
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
    document.getElementById('form').scrollIntoView({ behavior: 'smooth' });
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



