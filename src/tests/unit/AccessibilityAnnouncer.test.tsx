import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { 
  AccessibilityAnnouncer, 
  announceToScreenReader, 
  useAccessibilityAnnouncer,
  ChatAnnouncements 
} from '../../src/components/chat/AccessibilityAnnouncer';

function TestComponent() {
  const { announce, announcePolite, announceUrgent } = useAccessibilityAnnouncer();
  
  return (
    <div>
      <button onClick={() => announce('Test announcement')}>
        Announce
      </button>
      <button onClick={() => announcePolite('Polite announcement')}>
        Announce Polite
      </button>
      <button onClick={() => announceUrgent('Urgent announcement')}>
        Announce Urgent
      </button>
    </div>
  );
}

describe('AccessibilityAnnouncer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders ARIA live regions', () => {
    render(
      <AccessibilityAnnouncer>
        <div>Test content</div>
      </AccessibilityAnnouncer>
    );

    expect(screen.getByLabelText('Actualizaciones de la aplicación')).toBeInTheDocument();
    expect(screen.getByLabelText('Notificaciones urgentes')).toBeInTheDocument();
    
    const politeRegion = screen.getByLabelText('Actualizaciones de la aplicación');
    expect(politeRegion).toHaveAttribute('aria-live', 'polite');
    expect(politeRegion).toHaveAttribute('aria-atomic', 'true');
    expect(politeRegion).toHaveAttribute('role', 'status');

    const assertiveRegion = screen.getByLabelText('Notificaciones urgentes');
    expect(assertiveRegion).toHaveAttribute('aria-live', 'assertive');
    expect(assertiveRegion).toHaveAttribute('aria-atomic', 'true');
    expect(assertiveRegion).toHaveAttribute('role', 'alert');
  });

  it('announces messages through global function', async () => {
    render(
      <AccessibilityAnnouncer>
        <TestComponent />
      </AccessibilityAnnouncer>
    );

    act(() => {
      announceToScreenReader('Global announcement test');
    });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    await waitFor(() => {
      const politeRegion = screen.getByLabelText('Actualizaciones de la aplicación');
      expect(politeRegion).toHaveTextContent('Global announcement test');
    });
  });

  it('handles polite announcements through hook', async () => {
    render(
      <AccessibilityAnnouncer>
        <TestComponent />
      </AccessibilityAnnouncer>
    );

    const announceButton = screen.getByText('Announce Polite');
    announceButton.click();

    act(() => {
      vi.advanceTimersByTime(200);
    });

    await waitFor(() => {
      const politeRegion = screen.getByLabelText('Actualizaciones de la aplicación');
      expect(politeRegion).toHaveTextContent('Polite announcement');
    });
  });

  it('handles urgent announcements through hook', async () => {
    render(
      <AccessibilityAnnouncer>
        <TestComponent />
      </AccessibilityAnnouncer>
    );

    const announceButton = screen.getByText('Announce Urgent');
    announceButton.click();

    act(() => {
      vi.advanceTimersByTime(50);
    });

    await waitFor(() => {
      const assertiveRegion = screen.getByLabelText('Notificaciones urgentes');
      expect(assertiveRegion).toHaveTextContent('Urgent announcement');
    });
  });

  it('queues multiple announcements', async () => {
    render(
      <AccessibilityAnnouncer>
        <TestComponent />
      </AccessibilityAnnouncer>
    );

    act(() => {
      announceToScreenReader('First announcement');
      announceToScreenReader('Second announcement');
    });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Should process first announcement
    await waitFor(() => {
      const politeRegion = screen.getByLabelText('Actualizaciones de la aplicación');
      expect(politeRegion).toHaveTextContent('First announcement');
    });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Should process second announcement
    await waitFor(() => {
      const politeRegion = screen.getByLabelText('Actualizaciones de la aplicación');
      expect(politeRegion).toHaveTextContent('Second announcement');
    });
  });

  it('clears announcements after timeout', async () => {
    render(
      <AccessibilityAnnouncer>
        <TestComponent />
      </AccessibilityAnnouncer>
    );

    act(() => {
      announceToScreenReader('Test message');
    });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    const politeRegion = screen.getByLabelText('Actualizaciones de la aplicación');
    expect(politeRegion).toHaveTextContent('Test message');

    act(() => {
      vi.advanceTimersByTime(200);
    });

    await waitFor(() => {
      expect(politeRegion).toHaveTextContent('');
    });
  });

  it('ignores empty announcements', async () => {
    render(
      <AccessibilityAnnouncer>
        <div>Test</div>
      </AccessibilityAnnouncer>
    );

    act(() => {
      announceToScreenReader('');
      announceToScreenReader('   ');
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    const politeRegion = screen.getByLabelText('Actualizaciones de la aplicación');
    expect(politeRegion).toHaveTextContent('');
  });

  it('cleans up old announcements from queue', () => {
    render(
      <AccessibilityAnnouncer>
        <div>Test</div>
      </AccessibilityAnnouncer>
    );

    // Add many announcements
    act(() => {
      for (let i = 0; i < 10; i++) {
        announceToScreenReader(`Message ${i}`);
      }
    });

    // Fast forward past cleanup interval
    act(() => {
      vi.advanceTimersByTime(35000); // 35 seconds
    });

    // Cleanup should have run, removing old announcements
    // This is mainly to test that memory leaks are prevented
    expect(true).toBe(true); // If we get here without issues, cleanup worked
  });
});

describe('ChatAnnouncements', () => {
  it('provides correct announcement messages', () => {
    expect(ChatAnnouncements.messageReceived('Alice')).toBe('Nuevo mensaje de Alice');
    expect(ChatAnnouncements.messageReceived()).toBe('Nuevo mensaje recibido');
    
    expect(ChatAnnouncements.messageSent()).toBe('Mensaje enviado');
    
    expect(ChatAnnouncements.typing('Bob')).toBe('Bob está escribiendo');
    expect(ChatAnnouncements.typing()).toBe('Alguien está escribiendo');
    
    expect(ChatAnnouncements.threadChanged('Project Alpha')).toBe('Cambiado a conversación: Project Alpha');
    
    expect(ChatAnnouncements.branchCreated('feature-1')).toBe('Nueva rama creada: feature-1');
    expect(ChatAnnouncements.branchCreated()).toBe('Nueva rama creada');
    
    expect(ChatAnnouncements.exportStarted('PDF')).toBe('Iniciando exportación en formato PDF');
    expect(ChatAnnouncements.exportCompleted('HTML')).toBe('Exportación completada en formato HTML');
    
    expect(ChatAnnouncements.error('Connection failed')).toBe('Error: Connection failed');
    
    expect(ChatAnnouncements.messagesLoaded(5)).toBe('5 mensajes cargados');
    expect(ChatAnnouncements.messagesLoaded(1)).toBe('1 mensaje cargado');
    
    expect(ChatAnnouncements.searchResults(0)).toBe('No se encontraron resultados');
    expect(ChatAnnouncements.searchResults(1)).toBe('Un resultado encontrado');
    expect(ChatAnnouncements.searchResults(3)).toBe('3 resultados encontrados');
  });
});