import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor, act, within } from '@testing-library/react'
import RoomIntegrationPage from '~/app/(protected)/device-integration/room-integration/page'
import { apiService } from '~/lib/api-service'
import { API_LIST } from '~/lib/api-list'
import { RoomData } from '~/types/device'
import { APP_NAME, generateTestId, SRS_ID } from '../../test-ids/utc-global'
import { ROOM_INTEGRATION_TEST_IDS } from '@/components/test-ids/room-integration.ids'

// Mock the loader context
jest.mock('@/context/loader-context', () => ({
  useLoader: () => ({
    showLoader: jest.fn(),
    hideLoader: jest.fn()
  })
}))

// Mock the API service
jest.mock('~/lib/api-service', () => ({
  apiService: {
    post: jest.fn(),
    put: jest.fn(),
  },
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

// Mock RoomItem component
jest.mock('~/components/device-integration/room-item', () => {
  return function MockRoomItem({ room, onDelete }: { room: RoomData; onDelete: (id: number) => void }) {
    return (
      <div data-testid={ROOM_INTEGRATION_TEST_IDS.ROOM_ITEM}>
        <p data-testid={ROOM_INTEGRATION_TEST_IDS.ROOM_NAME}>{room.roomName}</p>
        <p data-testid={ROOM_INTEGRATION_TEST_IDS.ROOM_BLACKBOX}>{room.blackboxName}</p>
        <p data-testid={ROOM_INTEGRATION_TEST_IDS.ROOM_USG}>{room.usgName}</p>
        <button onClick={() => onDelete(room.roomId)} data-testid={ROOM_INTEGRATION_TEST_IDS.DELETE_ROOM_BUTTON}>Delete</button>
      </div>
    )
  }
})

// Mock DeleteDialog component
jest.mock('@/components/reusables/dialogs/delete', () => ({
  DeleteDialog: function MockDeleteDialog({ open, title, message, onConfirm, onCancel }: { 
    open: boolean; 
    title: string; 
    message: string; 
    onConfirm: () => void; 
    onCancel: () => void;
  }) {
    if (!open) return null
    return (
      <div data-testid={ROOM_INTEGRATION_TEST_IDS.DELETE_DIALOG}>
        <h2>{title}</h2>
        <p>{message}</p>
        <button onClick={onConfirm} data-testid={ROOM_INTEGRATION_TEST_IDS.CONFIRM_DELETE_BUTTON}>Confirm</button>
        <button onClick={onCancel} data-testid={ROOM_INTEGRATION_TEST_IDS.CANCEL_DELETE_BUTTON}>Cancel</button>
      </div>
    )
  }
}))

// Mock AddRoomDialog component
jest.mock('~/components/device-integration/add-room-dialog', () => {
  return function MockAddRoomDialog({ open, onConfirm, onCancel }: { 
    open: boolean; 
    onConfirm: () => void; 
    onCancel: () => void;
  }) {
    if (!open) return null
    return (
      <div data-testid={ROOM_INTEGRATION_TEST_IDS.ADD_ROOM_DIALOG}>
        <input type="text" data-testid={ROOM_INTEGRATION_TEST_IDS.ROOM_NAME_INPUT} />
        <button onClick={onConfirm} data-testid={ROOM_INTEGRATION_TEST_IDS.CONFIRM_ADD_BUTTON}>Add Room</button>
        <button onClick={onCancel} data-testid={ROOM_INTEGRATION_TEST_IDS.CANCEL_ADD_BUTTON}>Cancel</button>
      </div>
    )
  }
})

// Mock SubheadingDivider component
jest.mock('~/components/reusables/form-fields/sub-heading', () => ({
  SubheadingDivider: function MockSubheadingDivider({ children }: { children: React.ReactNode }) {
    return <div data-testid={ROOM_INTEGRATION_TEST_IDS.SUBHEADING_DIVIDER}>{children}</div>
  }
}))

// Mock Button component
jest.mock('~/components/ui/button', () => ({
  Button: function MockButton({ children, onClick, className, 'data-testid': testId }: { 
    children: React.ReactNode; 
    onClick?: () => void; 
    className?: string;
    'data-testid'?: string;
  }) {
    return <button onClick={onClick} className={className} data-testid={testId}>{children}</button>
  }
}))

// Mock PlusCircle component
jest.mock('~/components/svg', () => ({
  PlusCircle: function MockPlusCircle({ className, stroke }: { className?: string; stroke?: string }) {
    return <span className={className} style={{ stroke }}>PlusCircle</span>
  }
}))

describe(`${APP_NAME}-${SRS_ID.ROOM_INTEGRATION}: RoomIntegrationPage`, () => {
  const mockRooms = [
    {
      roomId: 1,
      roomName: 'Room 1',
      deviceCount: 2,
      blackboxName: 'Blackbox 1',
      usgName: 'USG 1'
    },
    {
      roomId: 2,
      roomName: 'Room 2',
      deviceCount: 1,
      blackboxName: 'Blackbox 2',
      usgName: 'USG 2'
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    ;(apiService.post as jest.Mock).mockResolvedValue({ 
      success: true,
      data: { listData: mockRooms }
    })
    ;(apiService.put as jest.Mock).mockResolvedValue({ success: true })
  })

  it(`${generateTestId(SRS_ID.ROOM_INTEGRATION, 1)}: renders the page with initial data`, async () => {
    render(<RoomIntegrationPage />)
    
    // Check if the main elements are rendered
    expect(screen.getByTestId(ROOM_INTEGRATION_TEST_IDS.PAGE_CONTAINER)).toBeInTheDocument()
    expect(screen.getByTestId(ROOM_INTEGRATION_TEST_IDS.SUBHEADING_DIVIDER)).toHaveTextContent('Device Integration')
    expect(screen.getByTestId(ROOM_INTEGRATION_TEST_IDS.ROOM_CONFIG_HEADER)).toHaveTextContent('Room Integration')
    
    // Check the Add Room button
    const addButton = screen.getByTestId(ROOM_INTEGRATION_TEST_IDS.ADD_ROOM_BUTTON)
    expect(addButton).toBeInTheDocument()
    expect(addButton).toHaveTextContent('Add A Room')
    
    // Verify rooms are rendered
    const roomItems = await screen.findAllByTestId(ROOM_INTEGRATION_TEST_IDS.ROOM_ITEM)
    expect(roomItems).toHaveLength(2)
    
    // Verify first room details
    const firstRoom = roomItems[0]
    expect(within(firstRoom).getByTestId(ROOM_INTEGRATION_TEST_IDS.ROOM_NAME)).toHaveTextContent('Room 1')
    expect(within(firstRoom).getByTestId(ROOM_INTEGRATION_TEST_IDS.ROOM_BLACKBOX)).toHaveTextContent('Blackbox 1')
    expect(within(firstRoom).getByTestId(ROOM_INTEGRATION_TEST_IDS.ROOM_USG)).toHaveTextContent('USG 1')

    // Verify second room details
    const secondRoom = roomItems[1]
    expect(within(secondRoom).getByTestId(ROOM_INTEGRATION_TEST_IDS.ROOM_NAME)).toHaveTextContent('Room 2')
    expect(within(secondRoom).getByTestId(ROOM_INTEGRATION_TEST_IDS.ROOM_BLACKBOX)).toHaveTextContent('Blackbox 2')
    expect(within(secondRoom).getByTestId(ROOM_INTEGRATION_TEST_IDS.ROOM_USG)).toHaveTextContent('USG 2')
  })

  it(`${generateTestId(SRS_ID.ROOM_INTEGRATION, 2)}: opens add room dialog`, async () => {
    render(<RoomIntegrationPage />)
    
    // Click add room button
    const addButton = screen.getByTestId(ROOM_INTEGRATION_TEST_IDS.ADD_ROOM_BUTTON)
    await act(async () => {
      fireEvent.click(addButton)
    })
    
    // Verify dialog is shown
    expect(screen.getByTestId(ROOM_INTEGRATION_TEST_IDS.ADD_ROOM_DIALOG)).toBeInTheDocument()
  })

  it(`${generateTestId(SRS_ID.ROOM_INTEGRATION, 3)}: handles room deletion`, async () => {
    render(<RoomIntegrationPage />)
    
    // Wait for rooms to load
    const roomItems = await screen.findAllByTestId(ROOM_INTEGRATION_TEST_IDS.ROOM_ITEM)
    expect(roomItems).toHaveLength(2)
    
    // Click delete button for first room
    const deleteButtons = screen.getAllByTestId(ROOM_INTEGRATION_TEST_IDS.DELETE_ROOM_BUTTON)
    await act(async () => {
      fireEvent.click(deleteButtons[0])
    })
    
    // Verify delete dialog is shown
    expect(screen.getByTestId(ROOM_INTEGRATION_TEST_IDS.DELETE_DIALOG)).toBeInTheDocument()
    expect(screen.getByText(/This will permanently delete Room 1/)).toBeInTheDocument()
    
    // Confirm deletion
    const confirmButton = screen.getByTestId(ROOM_INTEGRATION_TEST_IDS.CONFIRM_DELETE_BUTTON)
    await act(async () => {
      fireEvent.click(confirmButton)
    })
    
    // Verify API was called
    expect(apiService.put).toHaveBeenCalledWith(
      API_LIST.DELETE_ROOM,
      mockRooms[0].roomId,
      undefined,
      expect.any(Object)
    )
  })

  it(`${generateTestId(SRS_ID.ROOM_INTEGRATION, 4)}: cancels room deletion`, async () => {
    render(<RoomIntegrationPage />)
    
    // Wait for rooms to load
    const roomItems = await screen.findAllByTestId(ROOM_INTEGRATION_TEST_IDS.ROOM_ITEM)
    expect(roomItems).toHaveLength(2)
    
    // Click delete button for first room
    const deleteButtons = screen.getAllByTestId(ROOM_INTEGRATION_TEST_IDS.DELETE_ROOM_BUTTON)
    await act(async () => {
      fireEvent.click(deleteButtons[0])
    })
    
    // Cancel deletion
    const cancelButton = screen.getByTestId(ROOM_INTEGRATION_TEST_IDS.CANCEL_DELETE_BUTTON)
    await act(async () => {
      fireEvent.click(cancelButton)
    })
    
    // Verify dialog is closed
    expect(screen.queryByTestId(ROOM_INTEGRATION_TEST_IDS.DELETE_DIALOG)).not.toBeInTheDocument()
    
    // Verify API was not called
    expect(apiService.put).not.toHaveBeenCalled()
  })

  it(`${generateTestId(SRS_ID.ROOM_INTEGRATION, 5)}: handles adding a new room`, async () => {
    render(<RoomIntegrationPage />)
    
    // Open add room dialog
    const addButton = screen.getByTestId(ROOM_INTEGRATION_TEST_IDS.ADD_ROOM_BUTTON)
    await act(async () => {
      fireEvent.click(addButton)
    })
    
    // Fill room name
    const nameInput = screen.getByTestId(ROOM_INTEGRATION_TEST_IDS.ROOM_NAME_INPUT)
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'New Room' } })
    })
    
    // Confirm add
    const confirmButton = screen.getByTestId(ROOM_INTEGRATION_TEST_IDS.CONFIRM_ADD_BUTTON)
    await act(async () => {
      fireEvent.click(confirmButton)
    })
    
    // Verify API was called to refresh room list
    expect(apiService.post).toHaveBeenCalledWith(
      API_LIST.GET_ALL_ROOMS,
      undefined,
      expect.any(Object)
    )
  })

  it(`${generateTestId(SRS_ID.ROOM_INTEGRATION, 6)}: handles API errors during room fetch`, async () => {
    const errorMessage = 'Failed to fetch rooms'
    ;(apiService.post as jest.Mock).mockRejectedValue(errorMessage)
    
    render(<RoomIntegrationPage />)
    
    // Since the component doesn't show error toast for fetch errors,
    // we just verify that the rooms list is empty
    await waitFor(() => {
      expect(screen.queryAllByTestId(ROOM_INTEGRATION_TEST_IDS.ROOM_ITEM)).toHaveLength(0)
    })
  })

  it(`${generateTestId(SRS_ID.ROOM_INTEGRATION, 7)}: handles API errors during room deletion`, async () => {
    const errorMessage = 'Failed to delete room'
    ;(apiService.put as jest.Mock).mockRejectedValue(errorMessage)
    
    render(<RoomIntegrationPage />)
    
    // Wait for rooms to load
    const roomItems = await screen.findAllByTestId(ROOM_INTEGRATION_TEST_IDS.ROOM_ITEM)
    expect(roomItems).toHaveLength(2)
    
    // Click delete button for first room
    const deleteButtons = screen.getAllByTestId(ROOM_INTEGRATION_TEST_IDS.DELETE_ROOM_BUTTON)
    await act(async () => {
      fireEvent.click(deleteButtons[0])
    })
    
    // Confirm deletion
    const confirmButton = screen.getByTestId(ROOM_INTEGRATION_TEST_IDS.CONFIRM_DELETE_BUTTON)
    await act(async () => {
      fireEvent.click(confirmButton)
    })
    
    // Since the component doesn't show error toast for delete errors,
    // we verify that the delete dialog is closed and the room is still in the list
    await waitFor(() => {
      expect(screen.queryByTestId(ROOM_INTEGRATION_TEST_IDS.DELETE_DIALOG)).not.toBeInTheDocument()
      expect(screen.getAllByTestId(ROOM_INTEGRATION_TEST_IDS.ROOM_ITEM)).toHaveLength(2)
    })
  })
}) 