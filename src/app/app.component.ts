import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { farewellConfig } from './data/farewell.data';
import { FarewellConfig } from './models/farewell-config.model';
import { Wish } from './models/wish.model';
import { WishesService } from './services/wishes.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './templates/app.component.html',
  styleUrl: './styles/app.component.css'
})
export class AppComponent implements OnInit {
  config: FarewellConfig = farewellConfig;
  wishes: Wish[] = [];
  showWishForm = false;
  selectedWish: Wish | null = null;
  toastMessage = '';
  showConfetti = false;
  isEnvelopeOpen = false;
  confettiPieces: Array<{ left: number; color: string; delay: number }> = [];

  scrollProgress = 0;
  isNavScrolled = false;
  showBackToTop = false;
  activeSection = 'home';

  wishForm: FormGroup;
  readonly emojiOptions = ['❤️', '🚀', '🌟', '🎉', '💡', '👏', '☕', '✨'];

  constructor(
    private readonly fb: FormBuilder,
    private readonly wishesService: WishesService
  ) {
    this.wishForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      role: [''],
      message: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(1000)]],
      emoji: ['❤️']
    });
  }

  ngOnInit(): void {
    this.wishes = this.wishesService.getWishes();
    window.setTimeout(() => {
      this.triggerConfetti();
    }, 800);
  }

  toggleEnvelope(): void {
    this.isEnvelopeOpen = !this.isEnvelopeOpen;
  }

  onEnvelopeTilt(event: MouseEvent): void {
    const wrap = event.currentTarget as HTMLElement;
    const rect = wrap.getBoundingClientRect();
    const relX = (event.clientX - rect.left) / rect.width - 0.5;
    const relY = (event.clientY - rect.top) / rect.height - 0.5;
    wrap.style.setProperty('--tilt-x', `${relX * 18}deg`);
    wrap.style.setProperty('--tilt-y', `${relY * -18}deg`);
  }

  onEnvelopeLeave(event: MouseEvent): void {
    const wrap = event.currentTarget as HTMLElement;
    wrap.style.setProperty('--tilt-x', '0deg');
    wrap.style.setProperty('--tilt-y', '0deg');
    this.isEnvelopeOpen = false;
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    this.scrollProgress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    this.isNavScrolled = scrollTop > 40;
    this.showBackToTop = scrollTop > 480;

    for (const id of ['home', 'wishes', 'farewell']) {
      const el = document.getElementById(id);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= 140 && rect.bottom > 140) {
          this.activeSection = id;
        }
      }
    }
  }

  createRipple(event: MouseEvent): void {
    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
    button.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  }

  scrollToSection(id: string): void {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  openWishForm(): void {
    this.showWishForm = true;
  }

  closeWishForm(): void {
    this.showWishForm = false;
    this.wishForm.reset({ name: '', role: '', message: '', emoji: '❤️' });
  }

  openWishDetails(wish: Wish): void {
    this.selectedWish = wish;
  }

  closeWishDetails(): void {
    this.selectedWish = null;
  }

  setEmoji(emoji: string): void {
    this.wishForm.patchValue({ emoji });
  }

  submitWish(): void {
    if (this.wishForm.invalid) {
      this.wishForm.markAllAsTouched();
      return;
    }

    const value = this.wishForm.getRawValue();
    const newWish: Wish = {
      id: Math.floor(Math.random() * Number.MAX_SAFE_INTEGER),
      name: value.name.trim(),
      role: value.role?.trim() || 'Team Member',
      message: value.message.trim(),
      emoji: value.emoji || '❤️',
    };

    this.wishesService.addWish(newWish);
    this.wishes = this.wishesService.getWishes();
    this.toastMessage = 'Your message has been added ❤️';
    this.triggerConfetti();
    this.closeWishForm();

    window.setTimeout(() => {
      this.toastMessage = '';
    }, 2200);

    const wishesSection = document.getElementById('wishes');
    if (wishesSection) {
      wishesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  triggerConfetti(): void {
    const confettiDurationMs = 2400;
    const maxLaunchDelayMs = 3200;

    this.showConfetti = true;
    this.confettiPieces = Array.from({ length: 36 }, (_, index) => ({
      left: 6 + (index * 4) % 88,
      color: ['#6a5cff', '#ef8c84', '#f5d77d', '#9cd7c9', '#f7c5d9'][index % 5],
      delay: Math.floor(Math.random() * maxLaunchDelayMs)
    }));

    window.setTimeout(() => {
      this.showConfetti = false;
    }, confettiDurationMs + maxLaunchDelayMs + 400);
  }
}
