/**
 * Base Modal Class
 * All modals extend this class for consistent behavior
 */

export abstract class BaseModal {
  protected modalElement: HTMLElement | null = null;
  protected isOpen: boolean = false;
  
  /**
   * Show the modal - creates and appends to DOM if needed
   */
  public async show(): Promise<void> {
    if (!this.modalElement) {
      this.modalElement = this.render();
      document.body.appendChild(this.modalElement);
    }
    
    // Trigger layout before animation
    this.modalElement.offsetHeight;
    
    this.modalElement.style.display = 'block';
    this.isOpen = true;
    
    // Call lifecycle hook
    await this.onShow();
  }
  
  /**
   * Hide the modal
   */
  public hide(): void {
    if (this.modalElement) {
      this.modalElement.style.display = 'none';
      this.isOpen = false;
      
      // Call lifecycle hook
      this.onHide();
    }
  }
  
  /**
   * Remove modal from DOM
   */
  public destroy(): void {
    if (this.modalElement && this.modalElement.parentNode) {
      this.modalElement.parentNode.removeChild(this.modalElement);
      this.modalElement = null;
      this.isOpen = false;
    }
  }
  
  /**
   * Create and return the modal HTML element
   * Must be implemented by child classes
   */
  public abstract render(): HTMLElement;
  
  /**
   * Lifecycle hook called after modal is shown
   * Override in child classes for custom behavior
   */
  protected async onShow(): Promise<void> {
    // Override in child classes
  }
  
  /**
   * Lifecycle hook called after modal is hidden
   * Override in child classes for custom behavior
   */
  protected onHide(): void {
    // Override in child classes
  }
  
  /**
   * Helper to create modal container with common styles
   */
  protected createModalContainer(id: string, backgroundColor: string = 'rgba(0,0,0,0.95)'): HTMLElement {
    const modal = document.createElement('div');
    modal.id = id;
    modal.style.cssText = `
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: ${backgroundColor};
      z-index: 1000;
      overflow-y: auto;
      padding: 20px;
      box-sizing: border-box;
    `;
    return modal;
  }
  
  /**
   * Helper to create close button
   */
  protected createCloseButton(onClose?: () => void): HTMLElement {
    const button = document.createElement('button');
    button.textContent = '✕';
    button.style.cssText = `
      position: absolute;
      top: 20px;
      right: 20px;
      background: rgba(255,255,255,0.2);
      border: none;
      color: white;
      font-size: 28px;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      cursor: pointer;
      transition: background 0.3s;
      z-index: 10;
    `;
    
    button.addEventListener('mouseenter', () => {
      button.style.background = 'rgba(255,255,255,0.3)';
    });
    
    button.addEventListener('mouseleave', () => {
      button.style.background = 'rgba(255,255,255,0.2)';
    });
    
    button.addEventListener('click', () => {
      if (onClose) {
        onClose();
      } else {
        this.hide();
      }
    });
    
    return button;
  }
  
  /**
   * Helper to create modal header
   */
  protected createHeader(title: string, emoji: string = ''): HTMLElement {
    const header = document.createElement('div');
    header.style.cssText = `
      text-align: center;
      margin-bottom: 30px;
    `;
    
    const heading = document.createElement('h1');
    heading.textContent = `${emoji} ${title}`;
    heading.style.cssText = `
      color: white;
      font-size: 42px;
      margin: 0;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
    `;
    
    header.appendChild(heading);
    return header;
  }
}
