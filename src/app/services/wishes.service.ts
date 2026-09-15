import { Injectable } from '@angular/core';

import { defaultWishes } from '../data/wishes.data';
import { Wish } from '../models/wish.model';

@Injectable({
  providedIn: 'root'
})
export class WishesService {
  private readonly storageKey = 'farewell-wishes-v2';

  private getStoredWishes(): Wish[] {
    if (typeof localStorage === 'undefined') {
      return [];
    }

    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) {
        return [...defaultWishes];
      }

      const parsed = JSON.parse(raw) as Wish[];
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : [...defaultWishes];
    } catch {
      return [...defaultWishes];
    }
  }

  getWishes(): Wish[] {
    return this.getStoredWishes();
  }

  addWish(wish: Wish): void {
    const current = this.getStoredWishes();
    const next = [wish, ...current];

    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(next));
      } catch {
        // Ignore storage quota issues; keep UI working without persistence.
      }
    }
  }
}
