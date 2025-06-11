import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FilterDropdown from '../../site-resources/filter-dropdown';
import { apiService } from '@/lib/api-service';
import siteResource from '@/components/test-ids/site-resource.ids';

// Mock the API service
jest.mock('@/lib/api-service', () => ({
  apiService: {
    post: jest.fn()
  }
}));

// Mock the loader context
jest.mock('@/context/loader-context', () => ({
  useLoader: () => ({
    showLoader: jest.fn(),
    hideLoader: jest.fn()
  })
}));

describe('FilterDropdown Component', () => {
  const mockProps = {
    selectedTags: ['Tag1', 'Tag2'],
    onTagsChange: jest.fn(),
    onClose: jest.fn(),
    handleClearAll: jest.fn()
  };

  const mockResponse = {
    data: {
      listData: [
        { tags: ['Tag1', 'Tag2', 'Tag3'] },
        { tags: ['Tag2', 'Tag4'] },
        { tags: ['Tag1', 'Tag5'] }
      ]
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (apiService.post as jest.Mock).mockResolvedValue(mockResponse);
  });

  it('should render with selected tags', async () => {
    render(<FilterDropdown {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByTestId(siteResource.filterDropdown)).toBeInTheDocument();
    });

    // Check if selected tags are checked
    const tag1Checkbox = screen.getByTestId(`${siteResource.tagLabel}-Tag1`).previousElementSibling;
    const tag2Checkbox = screen.getByTestId(`${siteResource.tagLabel}-Tag2`).previousElementSibling;
    expect(tag1Checkbox).toBeChecked();
    expect(tag2Checkbox).toBeChecked();
  });

  it('should fetch and display available tags', async () => {
    render(<FilterDropdown {...mockProps} />);
    
    await waitFor(() => {
      expect(apiService.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        { params: { getAllTags: true } }
      );
    });

    // Check if all unique tags are displayed
    expect(screen.getByTestId(`${siteResource.tagLabel}-Tag1`)).toBeInTheDocument();
    expect(screen.getByTestId(`${siteResource.tagLabel}-Tag2`)).toBeInTheDocument();
    expect(screen.getByTestId(`${siteResource.tagLabel}-Tag3`)).toBeInTheDocument();
    expect(screen.getByTestId(`${siteResource.tagLabel}-Tag4`)).toBeInTheDocument();
    expect(screen.getByTestId(`${siteResource.tagLabel}-Tag5`)).toBeInTheDocument();
  });

  it('should handle tag selection', async () => {
    const user = userEvent.setup();
    render(<FilterDropdown {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByTestId(siteResource.filterDropdown)).toBeInTheDocument();
    });

    // Click on a new tag
    const tag3Label = screen.getByTestId(`${siteResource.tagLabel}-Tag3`);
    await user.click(tag3Label);

    // Click Done
    const doneButton = screen.getByText('Done');
    await user.click(doneButton);

    expect(mockProps.onTagsChange).toHaveBeenCalledWith(['Tag1', 'Tag2', 'Tag3']);
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('should handle tag deselection', async () => {
    const user = userEvent.setup();
    render(<FilterDropdown {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByTestId(siteResource.filterDropdown)).toBeInTheDocument();
    });

    // Deselect an existing tag
    const tag1Label = screen.getByTestId(`${siteResource.tagLabel}-Tag1`);
    await user.click(tag1Label);

    // Click Done
    const doneButton = screen.getByText('Done');
    await user.click(doneButton);

    expect(mockProps.onTagsChange).toHaveBeenCalledWith(['Tag2']);
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('should handle clear all', async () => {
    const user = userEvent.setup();
    render(<FilterDropdown {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByTestId(siteResource.filterDropdown)).toBeInTheDocument();
    });

    // Click Clear all
    const clearAllButton = screen.getByTestId(siteResource.clearAll);
    await user.click(clearAllButton);

    // Click Done
    const doneButton = screen.getByText('Done');
    await user.click(doneButton);

    expect(mockProps.handleClearAll).toHaveBeenCalled();
    expect(mockProps.onTagsChange).toHaveBeenCalledWith([]);
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('should handle API error gracefully', async () => {
    (apiService.post as jest.Mock).mockRejectedValue(new Error('API Error'));
    
    render(<FilterDropdown {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByTestId(siteResource.filterDropdown)).toBeInTheDocument();
    });

    // Component should still render without crashing
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('should update local state when props change', async () => {
    const { rerender } = render(<FilterDropdown {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByTestId(siteResource.filterDropdown)).toBeInTheDocument();
    });

    // Update props with new tags
    rerender(<FilterDropdown {...mockProps} selectedTags={['Tag3', 'Tag4']} />);

    // Check if checkboxes are updated
    const tag3Checkbox = screen.getByTestId(`${siteResource.tagLabel}-Tag3`).previousElementSibling;
    const tag4Checkbox = screen.getByTestId(`${siteResource.tagLabel}-Tag4`).previousElementSibling;
    expect(tag3Checkbox).toBeChecked();
    expect(tag4Checkbox).toBeChecked();
  });

  it('should handle empty tags array', async () => {
    render(<FilterDropdown {...mockProps} selectedTags={[]} />);
    
    await waitFor(() => {
      expect(screen.getByTestId(siteResource.filterDropdown)).toBeInTheDocument();
    });

    // Clear all button should be disabled
    const clearAllButton = screen.getByTestId(siteResource.clearAll);
    expect(clearAllButton).toBeDisabled();
  });
}); 