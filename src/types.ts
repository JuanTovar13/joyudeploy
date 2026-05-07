export interface JoyuItem {
  id: number | string;
  title: string;
  description: string;
  image: string;
}


export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}