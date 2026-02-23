import { CodegenConfig } from "@graphql-codegen/cli"


const config: CodegenConfig = {

    schema: "http://localhost:4000/graphql",

    documents: ['src/**/*.{ts,tsx}'],

    generates: {
        './src/graphql-types/': {
            preset: 'client',
            config: {
                useTypeImports: true
            },
            plugins: []
        }
    },

    ignoreNoDocuments: true
}


export default config
