declare type GetProps<T> = {
  [K in keyof InstanceType<T> as K extends `$${string}`
    ? never
    : K]: InstanceType<T>[K];
};
