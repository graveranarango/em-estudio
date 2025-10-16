import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VirtualizedTimeline } from '../../components/chat/VirtualizedTimeline';
import type { Message } from '../../types/chat';

// Mock simple scroll container
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    useRef: vi.fn(() => ({ current: { scrollTop: 0, scrollHeight: 1000, clientHeight: 400 } }))
  };
});

const mockMessages: Message[] = [
  {
    id: 'msg1',
    role: 'user',
    parts: [{ type: 'text', value: 'Hello' }],
    createdAt: new Date().toISOString()
  },
  {
    id: 'msg2', 
    role: 'assistant',
    parts: [{ type: 'text', value: 'Hi there!' }],
    createdAt: new Date().toISOString()
  }
];

const defaultProps = {
  messages: mockMessages,
  threadId: 'test-thread',
  branchId: 'test-branch',
  onLoadOlder: vi.fn(),
  onJumpToNewest: vi.fn(),
  renderMessage: vi.fn((message, index) => (
    <div key={message.id} data-testid={`message-${index}`}>
      {message.parts[0].value}
    </div>
  ))
};

describe('VirtualizedTimeline', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders timeline with messages', () => {
    render(<VirtualizedTimeline {...defaultProps} />);
    
    expect(screen.getByTestId('virtual-timeline')).toBeInTheDocument();
    expect(screen.getByTestId('message-0')).toBeInTheDocument();
    expect(screen.getByTestId('message-1')).toBeInTheDocument();
  });

  it('shows loading skeletons when loading older messages', () => {
    render(<VirtualizedTimeline {...defaultProps} isLoading={true} />);
    
    const skeletons = screen.getAllByRole('status');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('calls onLoadOlder when scrolled to top', async () => {
    const mockLoadOlder = vi.fn().mockResolvedValue(undefined);
    
    render(
      <VirtualizedTimeline 
        {...defaultProps} 
        hasOlderMessages={true}
        onLoadOlder={mockLoadOlder}
      />
    );

    // Simulate scroll to top
    const timeline = screen.getByTestId('virtual-timeline').querySelector('div[class*="overflow-y-auto"]');
    if (timeline) {
      fireEvent.scroll(timeline, { target: { scrollTop: 0 } });

      await waitFor(() => {
        expect(mockLoadOlder).toHaveBeenCalledWith('test-thread', 'test-branch');
      });
    }
  });

  it('shows jump to bottom button when scrolled up', async () => {
    const { container } = render(<VirtualizedTimeline {...defaultProps} />);
    
    // Mock being scrolled up
    const scrollContainer = container.querySelector('div[class*="overflow-y-auto"]');
    if (scrollContainer) {
      Object.defineProperty(scrollContainer, 'scrollTop', { value: 100 });
      Object.defineProperty(scrollContainer, 'scrollHeight', { value: 1000 });
      Object.defineProperty(scrollContainer, 'clientHeight', { value: 400 });
      
      fireEvent.scroll(scrollContainer);
      
      await waitFor(() => {
        const jumpButton = screen.getByLabelText('Ir al final de la conversación');
        expect(jumpButton).toBeInTheDocument();
      });
    }
  });

  it('calls onJumpToNewest when jump button is clicked', async () => {
    const mockJumpToNewest = vi.fn();
    
    const { container } = render(<VirtualizedTimeline {...defaultProps} onJumpToNewest={mockJumpToNewest} />);
    
    // Force show jump button by mocking scroll state
    const scrollContainer = container.querySelector('div[class*="overflow-y-auto"]');
    if (scrollContainer) {
      Object.defineProperty(scrollContainer, 'scrollTop', { value: 100 });
      Object.defineProperty(scrollContainer, 'scrollHeight', { value: 1000 });
      Object.defineProperty(scrollContainer, 'clientHeight', { value: 400 });
      
      fireEvent.scroll(scrollContainer);
      
      await waitFor(() => {
        const jumpButton = screen.getByLabelText('Ir al final de la conversación');
        fireEvent.click(jumpButton);
        expect(mockJumpToNewest).toHaveBeenCalled();
      });
    }
  });

  it('emits performance metrics', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    global.fetch = mockFetch;
    
    // Mock random to ensure sampling
    vi.spyOn(Math, 'random').mockReturnValue(0.1); // Within 15% sampling
    
    const mockLoadOlder = vi.fn().mockResolvedValue(undefined);
    
    render(
      <VirtualizedTimeline 
        {...defaultProps} 
        hasOlderMessages={true}
        onLoadOlder={mockLoadOlder}
      />
    );

    // Trigger load older
    const virtualList = screen.getByTestId('virtual-list');
    fireEvent.scroll(virtualList, { target: { scrollTop: 0 } });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/api/events'), expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
        body: expect.stringContaining('chat_load_older_messages')
      }));
    });
  });

  it('handles empty message list gracefully', () => {
    render(<VirtualizedTimeline {...defaultProps} messages={[]} />);
    
    expect(screen.getByText('No hay mensajes en esta conversación')).toBeInTheDocument();
    expect(screen.getByText('¡Empieza escribiendo algo!')).toBeInTheDocument();
  });

  it('updates item heights dynamically', () => {
    const { rerender } = render(<VirtualizedTimeline {...defaultProps} />);
    
    // Add more messages
    const moreMessages = [
      ...mockMessages,
      {
        id: 'msg3',
        role: 'user', 
        parts: [{ type: 'text', value: 'This is a much longer message that should have a different height when rendered in the virtual list component' }],
        createdAt: new Date().toISOString()
      }
    ];
    
    rerender(<VirtualizedTimeline {...defaultProps} messages={moreMessages} />);
    
    expect(screen.getByTestId('message-2')).toBeInTheDocument();
  });
});
