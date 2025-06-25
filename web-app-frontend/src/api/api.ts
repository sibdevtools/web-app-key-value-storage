import axios from 'axios';

const api = axios.create({
  baseURL: '/web/app/key-value-storage/rest/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface GetSpacesRs {
  success: boolean;
  body: string[];
}

// Get all spaces
export const getSpaces = () => api.get<GetSpacesRs>('/spaces/');

export interface GetSpaceKeysRs {
  success: boolean;
  body: number;
}

// Get space keys
export const getKeys = (space: string) => api.get<GetSpaceKeysRs>(`/spaces/${space}/`);

export interface DeleteSpaceRs {
  success?: boolean;
}

// Delete space
export const deleteSpace = (space: string) => api.delete<DeleteSpaceRs>(`/spaces/${space}/`);


export interface SetValueRq {
  space: string;
  key: string;
  value: any;
  expiredAt: number;
}

// Set value
export const setValue = (rq: SetValueRq) => api.post<DeleteSpaceRs>(
  `/spaces/${rq.space}/${rq.key}/`,
  { value: rq.value, expiredAt: rq.expiredAt }
);


