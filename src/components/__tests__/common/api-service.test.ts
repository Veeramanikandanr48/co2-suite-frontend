// Move jest.mock to the very top
jest.mock('../../../lib/axios', () => {
  return {
    __esModule: true,
    default: {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
    },
  };
});

let apiService: typeof import('../../../lib/api-service').apiService;
let axiosInstance: jest.Mocked<typeof import('../../../lib/axios').default>;

describe('ApiService', () => {
  beforeEach(async () => {
    jest.resetModules();
    const apiServiceModule = await import('../../../lib/api-service');
    apiService = apiServiceModule.apiService;
    const axiosModule = await import('../../../lib/axios');
    axiosInstance = axiosModule.default as jest.Mocked<typeof axiosModule.default>;
    jest.clearAllMocks();
    axiosInstance.get.mockResolvedValue({ data: {} });
    axiosInstance.post.mockResolvedValue({ data: {} });
    axiosInstance.put.mockResolvedValue({ data: {} });
  });

  describe('get', () => {
    it('should make a GET request with correct parameters', async () => {
      const mockResponse = { data: { id: 1, name: 'Test' } };
      axiosInstance.get.mockResolvedValue(mockResponse);

      const result = await apiService.get('/test', { param: 'value' });

      expect(axiosInstance.get).toHaveBeenCalledWith('/test', {
        params: { param: 'value' },
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle GET request without query parameters', async () => {
      const mockResponse = { data: { id: 1, name: 'Test' } };
      axiosInstance.get.mockResolvedValue(mockResponse);

      const result = await apiService.get('/test');

      expect(axiosInstance.get).toHaveBeenCalledWith('/test', {
        params: undefined,
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getById', () => {
    it('should make a GET request with ID in URL', async () => {
      const mockResponse = { data: { id: 1, name: 'Test' } };
      axiosInstance.get.mockResolvedValue(mockResponse);

      const result = await apiService.getById('/test', 123);

      expect(axiosInstance.get).toHaveBeenCalledWith('/test/123', {
        params: undefined,
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle GET request with query parameters', async () => {
      const mockResponse = { data: { id: 1, name: 'Test' } };
      axiosInstance.get.mockResolvedValue(mockResponse);

      const result = await apiService.getById('/test', 123, { param: 'value' });

      expect(axiosInstance.get).toHaveBeenCalledWith('/test/123', {
        params: { param: 'value' },
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('post', () => {
    it('should make a POST request with data', async () => {
      const mockData = { name: 'Test' };
      const mockResponse = { data: { id: 1, ...mockData } };
      axiosInstance.post.mockResolvedValue(mockResponse);

      const result = await apiService.post('/test', mockData);

      expect(axiosInstance.post).toHaveBeenCalledWith('/test', mockData, undefined);
      expect(result).toEqual(mockResponse);
    });

    it('should handle POST request without data', async () => {
      const mockResponse = { data: { id: 1 } };
      axiosInstance.post.mockResolvedValue(mockResponse);

      const result = await apiService.post('/test');

      expect(axiosInstance.post).toHaveBeenCalledWith('/test', undefined, undefined);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('put', () => {
    it('should make a PUT request with ID and data', async () => {
      const mockData = { name: 'Updated' };
      const mockResponse = { data: { id: 123, ...mockData } };
      axiosInstance.put.mockResolvedValue(mockResponse);

      const result = await apiService.put('/test', 123, mockData);

      expect(axiosInstance.put).toHaveBeenCalledWith('/test/123', mockData, undefined);
      expect(result).toEqual(mockResponse);
    });

    it('should handle PUT request without data', async () => {
      const mockResponse = { data: { id: 123 } };
      axiosInstance.put.mockResolvedValue(mockResponse);

      const result = await apiService.put('/test', 123);

      expect(axiosInstance.put).toHaveBeenCalledWith('/test/123', undefined, undefined);
      expect(result).toEqual(mockResponse);
    });
  });
}); 