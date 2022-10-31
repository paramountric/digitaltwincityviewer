import {useQuery, gql} from '@apollo/client';

const USER_QUERY = gql`
  query User {
    user {
      id
      suuid
      email
      name
      bio
      company
      avatar
      verified
      profiles
      role
      suuid
    }
  }
`;

type User = {
  id: string;
  email: string;
  name: string;
  bio?: string;
  company?: string;
  avatar?: string;
  verified?: boolean;
  profiles?: any;
  role?: string;
  suuid?: string;
};

export const useUser = (): {user: User | null; isLoading: boolean} => {
  const {data, loading} = useQuery(USER_QUERY, {
    variables: {
      cursor: null,
    },
  });
  console.log('user', data, loading);
  let user: User | undefined;
  if (data && data.user) {
    console.log(data);
    const {id, email, name, avatar} = data.user;
    user = {
      id,
      name,
      email,
      avatar,
    };
  }
  return {
    user: user || null,
    isLoading: loading,
  };
};
