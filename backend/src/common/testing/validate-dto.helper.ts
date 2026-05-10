import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

export async function validateDto<T extends object>(
  cls: new () => T,
  plain: object,
): Promise<string[]> {
  const instance = plainToInstance(cls, plain);
  const errors = await validate(instance);
  return errors.map((e) => Object.values(e.constraints ?? {}).join(', '));
}
