export type Diff<T, U> = Exclude<T, U>;
export type Omit<T, K extends keyof any> = Pick<T, Diff<keyof T, K>>;