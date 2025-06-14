// NASA APOD API key
const API_KEY = 'qCooQBr0ITsRxFTIgD65FGQ30edRd4zB7iMzd1gG';

// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// Get references to DOM elements
const startDateInput = document.getElementById('startDate');
const endDateInput = document.getElementById('endDate');
const getImagesButton = document.querySelector('.filters button');
const gallery = document.getElementById('gallery');

// Listen for button click to fetch images
getImagesButton.addEventListener('click', () => {
  // Get the selected start and end dates
  const startDate = startDateInput.value;
  const endDate = endDateInput.value;

  // Check if both dates are selected
  if (!startDate || !endDate) {
    alert('Please select both a start and end date.');
    return;
  }

  // Show loading message before fetching images
  gallery.innerHTML = '<p style="color: #0b3d91; font-weight: bold;">Loading images from NASA...</p>';

  // Build the NASA APOD API URL with the selected dates and API key
  const apiUrl = `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&start_date=${startDate}&end_date=${endDate}`;

  // Fetch data from the NASA APOD API
  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      // Clear the gallery
      gallery.innerHTML = '';

      // If the API returns a single object, put it in an array
      const images = Array.isArray(data) ? data : [data];

      // Loop through each item and add it to the gallery
      images.forEach(item => {
        // Create a div for the gallery item
        const itemDiv = document.createElement('div');
        itemDiv.className = 'gallery-item';

        // Check if the item is an image
        if (item.media_type === 'image') {
          // Add the image, title, and date
          itemDiv.innerHTML = `
            <img src="${item.url}" alt="${item.title}" />
            <p><strong>${item.title}</strong></p>
            <p>${item.date}</p>
          `;
          // When the gallery item is clicked, open the modal with details
          itemDiv.addEventListener('click', () => {
            openModal(item);
          });
        } else if (item.media_type === 'video') {
          // Handle video entries
          // Try to embed YouTube or Vimeo videos, otherwise show a link
          let videoEmbed = '';
          if (item.url.includes('youtube.com') || item.url.includes('youtu.be')) {
            // Extract YouTube video ID
            let videoId = '';
            if (item.url.includes('youtube.com')) {
              const urlParams = new URL(item.url).searchParams;
              videoId = urlParams.get('v');
            } else if (item.url.includes('youtu.be')) {
              videoId = item.url.split('/').pop();
            }
            if (videoId) {
              videoEmbed = `
                <iframe width="100%" height="200" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>
              `;
            }
          } else if (item.url.includes('vimeo.com')) {
            // Extract Vimeo video ID
            const videoId = item.url.split('/').pop();
            videoEmbed = `
              <iframe width="100%" height="200" src="https://player.vimeo.com/video/${videoId}" frameborder="0" allowfullscreen></iframe>
            `;
          }

          // If not embeddable, show a link
          if (!videoEmbed) {
            videoEmbed = `
              <a href="${item.url}" target="_blank" style="color:#0b3d91;font-weight:bold;">Watch Video</a>
            `;
          }

          // Add the video, title, and date
          itemDiv.innerHTML = `
            ${videoEmbed}
            <p><strong>${item.title}</strong></p>
            <p>${item.date}</p>
          `;

          // When the gallery item is clicked, open the modal with video details
          itemDiv.addEventListener('click', () => {
            openModal(item);
          });
        }

        // Add the item to the gallery
        gallery.appendChild(itemDiv);
      });

      // If no items found, show a message
      if (gallery.children.length === 0) {
        gallery.innerHTML = '<p>No images or videos found for this date range.</p>';
      }
    })
    .catch(error => {
      // Show error message if something goes wrong
      gallery.innerHTML = '<p>Sorry, there was a problem loading images.</p>';
      console.error('Error fetching NASA APOD:', error);
    });
});

// Get modal elements
const modal = document.getElementById('modal');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalExplanation = document.getElementById('modalExplanation');
const modalClose = document.getElementById('modalClose');

// Function to open the modal with image or video details
function openModal(item) {
  // If it's an image, show the image
  if (item.media_type === 'image') {
    modalImage.style.display = '';
    modalImage.src = item.hdurl || item.url;
    modalImage.alt = item.title;
    modalTitle.textContent = item.title;
    modalDate.textContent = item.date;
    modalExplanation.textContent = item.explanation;
    // Remove any previous video iframe
    removeModalVideo();
  }
  // If it's a video, embed or link the video in the modal
  else if (item.media_type === 'video') {
    modalImage.style.display = 'none'; // Hide the image element
    // Remove any previous video iframe
    removeModalVideo();
    let videoEmbed = '';
    if (item.url.includes('youtube.com') || item.url.includes('youtu.be')) {
      let videoId = '';
      if (item.url.includes('youtube.com')) {
        const urlParams = new URL(item.url).searchParams;
        videoId = urlParams.get('v');
      } else if (item.url.includes('youtu.be')) {
        videoId = item.url.split('/').pop();
      }
      if (videoId) {
        videoEmbed = `
          <iframe width="100%" height="350" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>
        `;
      }
    } else if (item.url.includes('vimeo.com')) {
      const videoId = item.url.split('/').pop();
      videoEmbed = `
        <iframe width="100%" height="350" src="https://player.vimeo.com/video/${videoId}" frameborder="0" allowfullscreen></iframe>
      `;
    }
    if (!videoEmbed) {
      videoEmbed = `
        <a href="${item.url}" target="_blank" style="color:#0b3d91;font-weight:bold;display:block;margin-bottom:10px;">Watch Video</a>
      `;
    }
    // Insert the video embed or link before the title
    modalTitle.insertAdjacentHTML('beforebegin', videoEmbed);
    modalTitle.textContent = item.title;
    modalDate.textContent = item.date;
    modalExplanation.textContent = item.explanation;
  }
  // Show the modal
  modal.style.display = 'flex';
}

// Helper function to remove any video iframe or link from the modal
function removeModalVideo() {
  // Remove any iframe or video link inserted before modalTitle
  const prev = modalTitle.previousElementSibling;
  if (prev && (prev.tagName === 'IFRAME' || prev.tagName === 'A')) {
    prev.remove();
  }
}

// Function to close the modal
function closeModal() {
  modal.style.display = 'none';
}

// Close modal when clicking the close button
modalClose.addEventListener('click', closeModal);

// Close modal when clicking outside the modal content
modal.addEventListener('click', function(event) {
  if (event.target === modal) {
    closeModal();
  }
});

// Array of fun "Did You Know?" space facts
const spaceFacts = [
  "Did you know? A day on Venus is longer than a year on Venus!",
  "Did you know? Neutron stars can spin at a rate of 600 rotations per second.",
  "Did you know? There are more trees on Earth than stars in the Milky Way.",
  "Did you know? The footprints on the Moon will be there for millions of years.",
  "Did you know? Jupiter is so big that over 1,300 Earths could fit inside it.",
  "Did you know? Space is completely silent—there’s no air to carry sound.",
  "Did you know? The hottest planet in our solar system is Venus.",
  "Did you know? One million Earths could fit inside the Sun.",
  "Did you know? The Sun makes up 99.8% of the mass in our solar system.",
  "Did you know? Saturn’s rings are made mostly of ice particles."
];

// Pick a random fact and display it
const spaceFactDiv = document.getElementById('spaceFact');
const randomIndex = Math.floor(Math.random() * spaceFacts.length);
spaceFactDiv.textContent = spaceFacts[randomIndex];
