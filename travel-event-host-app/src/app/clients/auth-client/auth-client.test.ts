import * as nextAuthreactModule from 'next-auth/react';
import { AuthClient } from './auth-client';

describe('AuthClient', () => {
  describe('register user', () => {
    const user = {
      firstName: 'John',
      lastName: 'Smith',
      email: 'test@test.com',
      password: 'Jword$1234',
    };
    test('should register a user', async () => {
      const fetchSpy = fetchMock.mockResponseOnce(JSON.stringify({ success: true }));

      await AuthClient.registerUser(user);
      expect(fetchSpy).toHaveBeenCalled();
    });
    test.each([
      ['custom error message', 'custom error message'],
      [undefined, 'Error: Cannot register user'],
    ])('registration scenario', async (result: string | undefined, errorMessage: string) => {
      fetchMock.mockImplementationOnce(() => {
        return Promise.resolve({
          status: 400,
          statusText: 'Bad Request',
          ok: false,
          json: () => {
            return Promise.resolve({ message: result });
          },
        } as any);
      });
      await expect(AuthClient.registerUser(user)).rejects.toThrow(errorMessage);
    });
  });

  describe('signInUser', () => {
    const signInCredentials = {
      email: 'test@test.com',
      password: 'pWord$1234',
      callBackUrl: 'http://localhost:3000',
    };
    test('res is null and is registering', async () => {
      const signInSpy = jest
        .spyOn(nextAuthreactModule, 'signIn')
        .mockResolvedValueOnce(null as any);

      await expect(
        AuthClient.signInUser({ ...signInCredentials, isRegistering: true }),
      ).rejects.toThrow('We have experienced an error. Please contact support.');
      expect(signInSpy).toHaveBeenCalled();
    });
    test('res is null and not registering', async () => {
      const signInSpy = jest
        .spyOn(nextAuthreactModule, 'signIn')
        .mockResolvedValueOnce(null as any);

      const signInResponse = await AuthClient.signInUser(signInCredentials);
      expect(signInResponse.success).toBe(false);
      expect(signInResponse.errors).toBeDefined();
      expect(signInResponse!.errors!.apiError).toEqual([
        'An unknown error occured. Please try again.',
      ]);
      expect(signInSpy).toHaveBeenCalled();
    });

    test('successfully sign in user', async () => {
      const signInSpy = jest
        .spyOn(nextAuthreactModule, 'signIn')
        .mockResolvedValueOnce({ status: 200, ok: true } as any);

      const signInResponse = await AuthClient.signInUser(signInCredentials);
      expect(signInResponse.success).toBe(true);
      expect(signInResponse.errors).toBeUndefined();
      expect(signInSpy).toHaveBeenCalled();
    });
    test('unsuccessful sign in user', async () => {
      const signInSpy = jest
        .spyOn(nextAuthreactModule, 'signIn')
        .mockResolvedValueOnce({ status: 400, ok: false } as any);

      const signInResponse = await AuthClient.signInUser(signInCredentials);
      expect(signInResponse.success).toBe(false);
      expect(signInResponse.errors).toBeDefined();
      expect(signInResponse!.errors!.email).toEqual([
        'Please check your credentials and try again',
      ]);
      expect(signInResponse!.errors!.password1).toEqual([
        'Please check your credentials and try again',
      ]);
      expect(signInSpy).toHaveBeenCalled();
    });
  });
});
