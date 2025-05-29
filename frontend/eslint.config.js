import globals from 'globals';
import pluginJs from '@eslint/js';
import pluginReact from 'eslint-plugin-react';
import pluginPrettier from 'eslint-plugin-prettier';
import configPrettier from 'eslint-config-prettier';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  { files: ['**/*.{js,mjs,cjs,jsx}'] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  pluginReact.configs.flat.recommended,
  // Registra el plugin de Prettier
  {
    plugins: {
      prettier: pluginPrettier,
    },
  },
  // Configura las reglas de Prettier
  {
    rules: {
      'prettier/prettier': [
        'error',
        {
          singleQuote: true, // Prettier usa comillas simples
          endOfLine: 'auto',
        },
      ],
    },
  },
  // Desactiva las reglas de formato de ESLint que podrían entrar en conflicto con Prettier
  configPrettier,
  {
    settings: {
      react: {
        version: 'detect', // Detecta automáticamente la versión de React
      },
    },
    rules: {
      'react/react-in-jsx-scope': 'off', // Desactiva la regla que requiere importar React en JSX
      'react/prop-types': 'off', // Desactiva la regla que requiere definir propTypes
    },
  },
];
