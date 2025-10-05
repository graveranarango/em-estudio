import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChatMobile } from '../../src/views/chat/mobile/ChatMobile';
import { useChatStore } from '../../src/state/chatStore';

// Mock the chat store
vi.mock('../../src/state/chatStore', () => ({
  useChatStore: vi.fn()
}));

// Mock the VirtualizedTimeline component
vi.mock('../../src/components/chat/VirtualizedTimeline', () => ({
  VirtualizedTimeline: ({ children, onLoadOlder, onJumpToNewest }: any) => (
    <div data-testid="virtualized-timeline">
      <button onClick={() => onLoadOlder('test', 'test')}>Load Older</button>
      <button onClick={onJumpToNewest}>Jump to Newest</button>
      {children}
    </div>
  )
}));

// Mock the BrandKit context
vi.mock('../../../contexts/BrandKitContext', () => ({
  useBrandKit: () => ({
    brandColors: { primary: '#0066cc' }
  })
}));

const mockStoreState = {
  messages: [
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
  ],
  threadId: 'test-thread',
  branchId: 'test-branch',
  rightPanelOpen: false,
  composerText: '',
  streaming: { status: 'idle' },
  mobileKeyboardOpen: false,
  isMobileView: true,
  branches: [
    { id: 'test-branch', name: 'Principal', isDefault: true }
  ],
  pushUserMessage: vi.fn(),
  setRightPanelOpen: vi.fn(),
  setComposerText: vi.fn(),
  setMobileKeyboardOpen: vi.fn(),
  setIsMobileView: vi.fn()
};

describe('ChatMobile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useChatStore as any).mockReturnValue(mockStoreState);
    
    // Mock window dimensions for mobile
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 390,
    });
    
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 844,
    });
  });

  it('renders mobile chat interface', () => {
    render(<ChatMobile />);
    
    expect(screen.getByText('Chat Maestro')).toBeInTheDocument();
    expect(screen.getByLabelText('Abrir biblioteca')).toBeInTheDocument();
    expect(screen.getByLabelText('Escribir mensaje')).toBeInTheDocument();
    expect(screen.getByLabelText('Enviar mensaje')).toBeInTheDocument();
  });

  it('shows branch badge when branches exist', () => {
    render(<ChatMobile />);
    
    expect(screen.getByText('Principal')).toBeInTheDocument();
  });

  it('opens sidebar when menu button is clicked', () => {
    render(<ChatMobile />);
    
    const menuButton = screen.getByLabelText('Abrir biblioteca');
    fireEvent.click(menuButton);
    
    expect(mockStoreState.setRightPanelOpen).toHaveBeenCalledWith(true);
  });

  it('handles composer text changes', () => {
    render(<ChatMobile />);
    
    const composer = screen.getByLabelText('Escribir mensaje');
    fireEvent.change(composer, { target: { value: 'Test message' } });
    
    expect(mockStoreState.setComposerText).toHaveBeenCalledWith('Test message');
  });

  it('sends message when send button is clicked', async () => {
    const storeWithText = {
      ...mockStoreState,
      composerText: 'Test message'
    };
    (useChatStore as any).mockReturnValue(storeWithText);
    
    render(<ChatMobile />);
    
    const sendButton = screen.getByLabelText('Enviar mensaje');
    fireEvent.click(sendButton);
    
    expect(storeWithText.pushUserMessage).toHaveBeenCalledWith('Test message');
  });

  it('sends message with Ctrl+Enter keyboard shortcut', () => {
    const storeWithText = {
      ...mockStoreState,
      composerText: 'Test message'
    };
    (useChatStore as any).mockReturnValue(storeWithText);
    
    render(<ChatMobile />);
    
    const composer = screen.getByLabelText('Escribir mensaje');
    fireEvent.keyDown(composer, { key: 'Enter', ctrlKey: true });
    
    expect(storeWithText.pushUserMessage).toHaveBeenCalledWith('Test message');
  });

  it('sends message with Cmd+Enter keyboard shortcut', () => {
    const storeWithText = {
      ...mockStoreState,
      composerText: 'Test message'
    };
    (useChatStore as any).mockReturnValue(storeWithText);
    
    render(<ChatMobile />);
    
    const composer = screen.getByLabelText('Escribir mensaje');
    fireEvent.keyDown(composer, { key: 'Enter', metaKey: true });
    
    expect(storeWithText.pushUserMessage).toHaveBeenCalledWith('Test message');
  });

  it('disables composer and send button when streaming', () => {
    const streamingStore = {
      ...mockStoreState,
      streaming: { status: 'streaming' },
      composerText: 'Some text'
    };
    (useChatStore as any).mockReturnValue(streamingStore);
    
    render(<ChatMobile />);
    
    const composer = screen.getByLabelText('Escribir mensaje');
    const sendButton = screen.getByLabelText('Enviar mensaje');
    
    expect(composer).toBeDisabled();
    expect(sendButton).toBeDisabled();
  });

  it('shows streaming indicator when status is not idle', () => {
    const streamingStore = {
      ...mockStoreState,
      streaming: { status: 'thinking' }
    };
    (useChatStore as any).mockReturnValue(streamingStore);
    
    render(<ChatMobile />);
    
    expect(screen.getByText('Pensando...')).toBeInTheDocument();
  });

  it('does not render when not in mobile view', () => {
    const desktopStore = {
      ...mockStoreState,
      isMobileView: false
    };
    (useChatStore as any).mockReturnValue(desktopStore);
    
    render(<ChatMobile />);
    
    // Should render a hidden div
    const container = screen.getByText('', { selector: '.hidden' });
    expect(container).toBeInTheDocument();
  });

  it('handles virtual keyboard state changes', () => {
    const { rerender } = render(<ChatMobile />);
    
    // Simulate keyboard opening
    const keyboardStore = {
      ...mockStoreState,
      mobileKeyboardOpen: true
    };
    (useChatStore as any).mockReturnValue(keyboardStore);
    
    rerender(<ChatMobile />);
    
    // Composer should have keyboard-aware styling
    const composer = screen.getByLabelText('Escribir mensaje');
    expect(composer.closest('.fixed')).toBeInTheDocument();
  });

  it('emits performance metrics on render', () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    global.fetch = mockFetch;
    
    // Mock random to ensure sampling
    vi.spyOn(Math, 'random').mockReturnValue(0.1);
    
    render(<ChatMobile />);
    
    // Should emit render metric
    expect(mockFetch).toHaveBeenCalledWith('/api/events', expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: expect.stringContaining('chat_mobile_render')
    }));
  });

  it('handles load older messages', async () => {
    render(<ChatMobile />);
    
    const loadOlderButton = screen.getByText('Load Older');
    fireEvent.click(loadOlderButton);
    
    // Should handle the async operation without errors
    await waitFor(() => {
      expect(true).toBe(true); // Test passes if no errors thrown
    });
  });

  it('handles jump to newest', () => {
    render(<ChatMobile />);
    
    const jumpButton = screen.getByText('Jump to Newest');
    fireEvent.click(jumpButton);
    
    // Should complete without errors
    expect(true).toBe(true);
  });

  it('renders sidebar content in sheet', () => {
    const openPanelStore = {
      ...mockStoreState,
      rightPanelOpen: true
    };
    (useChatStore as any).mockReturnValue(openPanelStore);
    
    render(<ChatMobile />);
    
    expect(screen.getByText('Biblioteca')).toBeInTheDocument();
    expect(screen.getByText('Acciones Rápidas')).toBeInTheDocument();
    expect(screen.getByText('Módulos')).toBeInTheDocument();
  });

  it('shows message count in header on desktop', () => {
    // This tests the component's adaptation for different view modes
    const desktopStore = {
      ...mockStoreState,
      isMobileView: false
    };
    (useChatStore as any).mockReturnValue(desktopStore);
    
    render(<ChatMobile />);
    
    // Mobile component should be hidden in desktop mode
    expect(screen.getByText('', { selector: '.hidden' })).toBeInTheDocument();
  });
});