import '@testing-library/jest-dom';
import { act, renderHook } from '@testing-library/react';
import { useToast, toast } from '@/hooks/use-toast';
import { ToastType } from '@/enums/base-enum';

// Mock setTimeout
jest.useFakeTimers();

describe('useToast Hook', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should initialize with empty toasts', () => {
    const { result } = renderHook(() => useToast());
    expect(result.current.toasts).toHaveLength(0);
  });

  it('should respect toast limit', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      // Add more toasts than the limit
      for (let i = 0; i < ToastType.LIMIT + 2; i++) {
        result.current.toast({
          title: `Toast ${i}`,
        });
      }
    });

    expect(result.current.toasts).toHaveLength(ToastType.LIMIT);
  });

  it('should update a toast', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({
        title: 'Updated Title',
      });
    });

    expect(result.current.toasts[0].title).toBe('Updated Title');
  });

  it('should dismiss a specific toast', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.toast({
        title: 'Test Toast',
      });
    });

    act(() => {
      result.current.dismiss(result.current.toasts[0].id);
    });

    expect(result.current.toasts[0].open).toBe(false);
  });

  it('should dismiss all toasts', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.toast({ title: 'Toast 1' });
      result.current.toast({ title: 'Toast 2' });
    });

    act(() => {
      result.current.dismiss();
    });

    result.current.toasts.forEach(toast => {
      expect(toast.open).toBe(false);
    });
  });

  it('should handle toast with custom duration', () => {
    const { result } = renderHook(() => useToast());
    const customDuration = ToastType.DURATION;
    
    act(() => {
      result.current.toast({
        title: 'Test Toast',
        duration: customDuration,
      });
    });

    expect(result.current.toasts[0].duration).toBe(customDuration);
  });

  it('should handle toast with data-testid', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.toast({
        title: 'Test Toast',
        'data-testid': 'test-toast',
      });
    });

    expect(result.current.toasts[0]['data-testid']).toBe('test-toast');
  });

  it('should handle toast update with dismiss', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.toast({
        title: 'Test Toast',
      });
    });

    act(() => {
      result.current.dismiss();
    });

    expect(result.current.toasts[0].open).toBe(false);
  });

  it('should handle multiple listeners', () => {
    const { result: result1 } = renderHook(() => useToast());
    const { result: result2 } = renderHook(() => useToast());
    
    act(() => {
      result1.current.toast({
        title: 'Test Toast',
      });
    });

    expect(result1.current.toasts).toHaveLength(1);
    expect(result2.current.toasts).toHaveLength(1);
  });

  it('should clean up listeners on unmount', () => {
    const { unmount } = renderHook(() => useToast());
    unmount();
    
    act(() => {
      toast({ title: 'Test Toast' });
    });
  });

  it('should update toast with partial data', () => {
    const { result } = renderHook(() => useToast());
    let toastId = '';
    
    act(() => {
      const { id, update } = result.current.toast({
        title: 'Original Title',
        description: 'Original Description'
      });
      toastId = id;
      
      // Update with partial data
      update({
        id: toastId,
        title: 'Updated Title'
      });
    });

    expect(result.current.toasts[0]).toMatchObject({
      id: toastId,
      title: 'Updated Title',
      description: 'Original Description'
    });
  });

  it('should handle dismiss toast with specific ID', () => {
    const { result } = renderHook(() => useToast());
    let toastId: string;
    
    act(() => {
      const { id } = result.current.toast({
        title: 'Test Toast'
      });
      toastId = id;
    });

    act(() => {
      result.current.dismiss(toastId);
    });

    // Verify toast is marked as closed
    expect(result.current.toasts[0].open).toBe(false);

    // Advance timer to trigger removal
    act(() => {
      jest.advanceTimersByTime(ToastType.DURATION);
    });

    // Verify toast is removed
    expect(result.current.toasts).toHaveLength(0);
  });

  it('should handle multiple dispatch calls', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      // Add multiple toasts
      result.current.toast({ title: 'Toast 1' });
    });

    expect(result.current.toasts).toHaveLength(1);

    act(() => {
      // Update all toasts
      result.current.toasts.forEach(toast => {
        result.current.dismiss(toast.id);
      });
    });

    // Verify all toasts are marked as closed
    result.current.toasts.forEach(toast => {
      expect(toast.open).toBe(false);
    });
  });

  it('should handle toast onOpenChange callback', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      const { id } = result.current.toast({
        title: 'Test Toast',
        onOpenChange: (open) => {
          if (!open) {
            result.current.dismiss(id);
          }
        }
      });
    });

    // Simulate toast being closed
    act(() => {
      result.current.toasts[0].onOpenChange?.(false);
    });

    // Verify toast is dismissed
    expect(result.current.toasts[0].open).toBe(false);
  });

  it('should handle multiple hook instances with state updates', () => {
    const { result: result1 } = renderHook(() => useToast());
    const { result: result2 } = renderHook(() => useToast());
    const { result: result3 } = renderHook(() => useToast());
    
    act(() => {
      result1.current.toast({ title: 'Toast from Hook 1' });
    });

    // Verify all hook instances have the same state
    expect(result1.current.toasts).toHaveLength(1);
    expect(result2.current.toasts).toHaveLength(1);
    expect(result3.current.toasts).toHaveLength(1);

    // Update toast from second hook instance
    act(() => {
      result2.current.toast({ title: 'Updated from Hook 2' });
    });

    // Verify all instances see the update
    expect(result1.current.toasts[0].title).toBe('Updated from Hook 2');
    expect(result2.current.toasts[0].title).toBe('Updated from Hook 2');
    expect(result3.current.toasts[0].title).toBe('Updated from Hook 2');
  });

  it('should handle toast update with new properties', () => {
    const { result } = renderHook(() => useToast());
    let toastId = '';
    
    act(() => {
      const { id, update } = result.current.toast({
        title: 'Original Title'
      });
      toastId = id;
      
      // Update with completely new properties
      update({
        id: toastId,
        title: 'New Title',
        description: 'New Description',
        variant: 'destructive'
      });
    });

    expect(result.current.toasts[0]).toMatchObject({
      id: toastId,
      title: 'New Title',
      description: 'New Description',
      variant: 'destructive'
    });
  });
}); 