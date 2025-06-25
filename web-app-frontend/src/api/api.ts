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
  body: string[];
}

// Get space keys
export const getKeys = (space: string) => api.get<GetSpaceKeysRs>(`/spaces/${space}/`);

export interface DeleteRs {
  success?: boolean;
}

// Delete space
export const deleteSpace = (space: string) => api.delete<DeleteRs>(`/spaces/${space}/`);

// Delete key
export const deleteKey = (space: string, key: string) => api.delete<DeleteRs>(`/spaces/${space}/${key}/`);

export interface SetValueRq {
  space: string;
  key: string;
  value: any;
  expiredAt?: number | null;
}

export interface ValueMeta {
  createdAt: number;
  modifiedAt: number;
  expiredAt: number | undefined | null;
  version: number;
}

export interface SetValueRs {
  success: boolean;
  body: ValueMeta;
}

// Set value
export const setValue = (rq: SetValueRq) => api.post<SetValueRs>(
  `/spaces/${rq.space}/${rq.key}/`,
  { value: rq.value, expiredAt: rq.expiredAt }
);

export interface ValueHolder {
  value: any;
  meta: ValueMeta;
}

export interface GetValueRs {
  success: boolean;
  body: ValueHolder;
}

// Get value
export const getValue = (space: string, key: string) => api.get<GetValueRs>(
  `/spaces/${space}/${key}/`,
);


