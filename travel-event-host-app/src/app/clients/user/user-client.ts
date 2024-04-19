import { LocationData } from '@/models/location';
import { SecureUser } from '@/types/secure-user';

export const UserClient = {
  getUserById: async (userId: string, scopes?: string[]): Promise<SecureUser | undefined> => {
    let endPoint: string = `/api/users/${userId}`;

    if (scopes && scopes.length > 0) {
      endPoint = endPoint.concat('?');

      endPoint = appendSearchParams(endPoint, 'scope', scopes);
    }

    try {
      const response = await fetch(endPoint);
      return response.json();
    } catch (error) {
      throw new Error('Error: Cannot fetch user');
    }
  },

  patchUserProfileById: async (
    userId: string,
    patchInfo: {
      firstName: string;
      lastName: string;
      bio: string;
      imageUrl?: string | null;
      deleteImageUrl?: boolean;
    },
  ): Promise<void> => {
    const endPoint: string = `/api/users/${userId}`;
    const req = await fetch(endPoint, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(patchInfo),
    });

    if (!req.ok) {
      throw new Error('Error: Cannot patch user profile');
    }
  },

  patchUserLocationById: async (userId: string, locationData: LocationData): Promise<void> => {
    const endPoint: string = `/api/users/${userId}/location`;
    const req = await fetch(endPoint, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(locationData),
    });

    if (!req.ok) {
      throw new Error('Error: Cannot patch user location');
    }
  },

  getUsersBySearchQuery: async (searchQuery: string): Promise<SecureUser[]> => {
    const endPoint: string = `/api/users/search?query=${searchQuery}`;
    const req = await fetch(endPoint);

    if (!req.ok) {
      throw new Error('Error: Cannot fetch users');
    }

    const response = await req.json();
    return response as SecureUser[];
  },
};

// Compute the endpoint with the search params. Remember to pre-append the '?'
function appendSearchParams(endPoint: string, key: string, values: string[]): string {
  const searchParams = new URLSearchParams();
  values.forEach((value) => searchParams.append(key, value));
  endPoint = endPoint.concat(`${searchParams.toString()}`);
  return endPoint;
}
