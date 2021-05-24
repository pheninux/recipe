GOOS=linux GOARCH=amd64 go build ./cmd/web
cp web agefice
rm -f web
scp agefice root@54.38.189.215:/var/www/go/deploy/agefice/
scp -r /Users/phenix/home/go/src/agefice-docs-web/ui root@54.38.189.215:/var/www/go/deploy/agefice/
scp -r /Users/phenix/home/go/src/agefice-docs-web/tls root@54.38.189.215:/var/www/go/deploy/agefice/

#generate certif
#go run /usr/local/go/src/crypto/tls/generate_cert.go --rsa-bits=2048 --host=localhost

