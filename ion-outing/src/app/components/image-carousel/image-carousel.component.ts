import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-image-carousel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="carousel-container">
      <div
        class="carousel-track"
        [style.transform]="'translateY(' + currentOffset + 'px)'"
      >
        <div class="carousel-item" *ngFor="let image of images">
          <img [src]="image.url" [alt]="image.alt" />
          <p>{{ image.caption }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .carousel-container {
        width: 100%;
        height: 400px;
        overflow: hidden;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        position: relative;
      }

      .carousel-track {
        display: flex;
        flex-direction: column;
        transition: transform 0.8s ease-in-out;
      }

      .carousel-item {
        height: 400px;
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-end;
        padding: 20px;
        position: relative;
        color: white;
        text-align: center;
        overflow: hidden;
      }

      .carousel-item img {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        z-index: 1;
      }

      .carousel-item::before {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 80px;
        background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%);
        z-index: 2;
      }

      .carousel-item p {
        font-size: 18px;
        font-weight: 700;
        margin: 0;
        color: white;
        text-shadow: 2px 2px 4px rgba(0,0,0,1);
        z-index: 3;
        position: relative;
        background: rgba(255, 107, 107, 0.8);
        padding: 12px 20px;
        border-radius: 25px;
        border: 2px solid rgba(255,255,255,0.4);
      }

      @media (max-width: 768px) {
        .carousel-container {
          height: 300px;
        }

        .carousel-item {
          height: 300px;
          padding: 15px;
        }

        .carousel-item img {
          width: 100%;
          height: 100%;
        }

        .carousel-item p {
          font-size: 16px;
        }
      }
    `,
  ],
})
export class ImageCarouselComponent implements OnInit, OnDestroy {
  currentOffset = 0;
  currentIndex = 0;
  private intervalId: any;

  images = [
    {
      url: 'assets/images/team2.jpg',
      alt: 'Previous Memories',
      caption: '📸 Let\'s view our previous memories together!',
    },
    {
      url: 'assets/images/team3.jpg',
      alt: 'Fun Activities',
      caption: 'Fun Activities for Everyone',
    },
    {
      url: 'assets/images/team7.jpg',
      alt: 'Outdoor Fun',
      caption: 'Outdoor Adventures',
    },
    {
      url: 'assets/images/team5.jpg',
      alt: 'Team Spirit',
      caption: 'Team Spirit & Unity',
    },
    {
      url: 'assets/images/team6.jpg',
      alt: 'Celebration',
      caption: 'Time to Celebrate!',
    },
    {
      url: 'assets/images/team4.jpg',
      alt: 'Team Games',
      caption: 'Exciting Team Games',
    },
    {
      url: 'assets/images/team8.jpg',
      alt: 'Group Photo',
      caption: 'Memories to Cherish',
    },
     {
      url: 'assets/images/team11.jpg',
      alt: 'Making a Splash Together!',
      caption: 'Making a Splash Together!',
    },
     {
      url: 'assets/images/team10.jpg',
      alt: 'Pool Party Fun & Memories',
      caption: 'Pool Party Fun & Memories',
    },
    {
      url: 'assets/images/team9.jpg',
      alt: 'Team Building',
      caption: 'Building Strong Teams Together',
    },
    {
      url: 'assets/images/team1.jpg',
      alt: 'New Adventure',
      caption: '🎆 Let\'s begin with our new shuffled teams! The adventure awaits - hurray!',
    },
  ];

  ngOnInit() {
    // Add a small delay to ensure component is fully initialized
    setTimeout(() => {
      this.startCarousel();
    }, 100);
  }

  ngOnDestroy() {
    console.log('Carousel component destroyed');
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  startCarousel() {
    if (this.intervalId) {
      console.log('Carousel already running, skipping');
      return;
    }
    
    console.log('Starting carousel with', this.images.length, 'images');
    let imageCount = 1; // Start from 1 since first image (index 0) is already showing
    
    this.intervalId = setInterval(() => {
      console.log('Carousel tick:', imageCount, 'of', this.images.length);
      if (imageCount < this.images.length) {
        this.currentIndex = imageCount;
        const containerHeight = window.innerWidth <= 768 ? 300 : 400;
        this.currentOffset = -this.currentIndex * containerHeight;
        console.log('Showing image', imageCount + 1, 'currentIndex:', this.currentIndex, 'offset:', this.currentOffset);
        imageCount++;
      } else {
        console.log('Carousel finished, clearing interval');
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    }, 3000);
  }
}
