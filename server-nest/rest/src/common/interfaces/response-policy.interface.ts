export interface IResponsePolicy {
  groups(target: any): string[] | undefined;
}
