import {
  isSchema,
  isValidSchema,
  Schema,
  validate,
  ValidationConfig,
} from 'jtd';

// validateUntrusted returns true if `data` satisfies `schema`, and false if it
// does not. Throws an error if `schema` is invalid, or if validation goes in an
// infinite loop.
export function validateUntrusted(schema: unknown, data: unknown): any {
  if (!isSchema(schema) || !isValidSchema(schema)) {
    throw new Error('invalid schema');
  }

  // You should tune maxDepth to be high enough that most legitimate schemas
  // evaluate without errors, but low enough that an attacker cannot cause a
  // denial of service attack.
  return validate(schema, data, { maxDepth: 32 } as ValidationConfig);
}
