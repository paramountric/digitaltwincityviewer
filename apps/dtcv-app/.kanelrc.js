const path = require('path');
const { recase } = require('@kristiandupont/recase');
const { generateZodSchemas } = require('kanel-zod');
const { makeKyselyHook } = require('kanel-kysely');
require('dotenv').config({ path: '.env.local' });

// Convert snake_case to PascalCase for type names
const toPascalCase = recase('snake', 'pascal');
const toCamelCase = recase('snake', 'camel');

const outputPath = './types/supabase';

console.log(process.env);

/** @type {import('kanel').Config} */
module.exports = {
  connection: {
    host: process.env.SUPABASE_DB_HOST,
    port: process.env.SUPABASE_DB_PORT,
    user: process.env.SUPABASE_DB_USER,
    password: process.env.SUPABASE_DB_PASSWORD,
    database: process.env.SUPABASE_DB_NAME,
  },

  schemas: ['public', 'n8n'],
  outputPath,
  preDeleteOutputFolder: true,

  // Customize type generation to be cleaner
  getMetadata: (details) => ({
    name: toPascalCase(details.name),
    comment: details.comment ? [details.comment] : [],
    path: path.join(outputPath, details.schemaName, toPascalCase(details.name)),
  }),

  // Use camelCase for properties
  getPropertyMetadata: (property) => ({
    name: toCamelCase(property.name),
    comment: property.comment
      ? [`Database type: ${property.expandedType}`, property.comment]
      : [`Database type: ${property.expandedType}`],
  }),

  // Generate flavored types for IDs (less verbose than branded types)
  generateIdentifierType: (column, details) => {
    const name = toPascalCase(details.name) + 'Id';
    return {
      declarationType: 'typeDeclaration',
      name,
      exportAs: 'named',
      typeDefinition: [`number & { __flavor?: '${name}' }`],
      comment: [`Identifier type for ${details.name}`],
    };
  },

  // Use type aliases instead of interfaces
  preRenderHooks: [
    generateZodSchemas,
    makeKyselyHook({
      useTypes: true, // Generate types instead of interfaces
    }),
  ],

  resolveViews: true,
};
