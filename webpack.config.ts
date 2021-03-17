import path from 'path'
import CopyWebpackPlugin from 'copy-webpack-plugin'

const config = () => {
    return {
        entry: {
            background: path.join(__dirname, 'src', 'background.js'),
            index: path.join(__dirname, 'src', 'index.js'),
        },
        output: {
            // distディレクトリに吐く
            path: path.join(__dirname, 'dist'),
            filename: '[name].js'
        },
        module: {
            rules: [
                {
                    test: /.ts$/,
                    use: 'ts-loader',
                    exclude: '/node_modules/'
                }
            ]
        },
        resolve: {
            extensions: ['.ts', '.js']
        },
        plugins: [
            // publicディレクトリにあるファイルをdistディレクトリにコピーする
            new CopyWebpackPlugin({
                patterns: [
                    {from: 'public', to: '.'}
                ]
            })
        ]
    }
}

export default config