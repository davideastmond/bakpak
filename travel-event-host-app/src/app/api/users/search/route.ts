import { connectMongoDB } from '@/lib/mongodb';
import { UserRepository } from '@/schemas/user';
import { NextResponse } from 'next/server';

export async function GET(req: Request, res: Response) {
  // This route should return an array of secureUsers by search query
  const { searchParams } = new URL(req.url);

  // This is a search query
  const query = searchParams.get('query');

  const pipeline = [
    {
      $search: {
        index: 'user-text-search',
        text: {
          query: query,
          path: {
            wildcard: '*',
          },
        },
      },
    },
    {
      $unset: [
        'password',
        'email',
        'location.formattedAddress',
        'location.timezone',
        'location.coords',
        'location.place_id',
      ],
    },
  ];
  await connectMongoDB();
  const results = await UserRepository.aggregate(pipeline);
  return NextResponse.json(results, { status: 200 });
}
