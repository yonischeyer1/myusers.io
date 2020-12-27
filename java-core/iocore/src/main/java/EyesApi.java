

import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.ResponseHandler;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;

import java.io.IOException;
import java.io.InputStream;


public class EyesApi {

    EyesApi() {

    }

    public String getIsCorrectImage(String actionId) throws IOException {
        CloseableHttpClient httpclient = HttpClients.createDefault();
        try {
            String endpoint = "http://localhost:3000/isCorrectImage?actionId=";
            endpoint = endpoint + actionId;
            HttpGet httpget = new HttpGet(endpoint);

            System.out.println("Executing request " + httpget.getRequestLine());

            // Create a custom response handler
            ResponseHandler<String> responseHandler = new ResponseHandler<String>() {

                @Override
                public String handleResponse(
                        final HttpResponse response) throws ClientProtocolException, IOException {
                    int status = response.getStatusLine().getStatusCode();
                    if (status >= 200 && status < 300) {
                        HttpEntity entity = response.getEntity();
                        return entity != null ? EntityUtils.toString(entity) : null;
                    } else {
                        throw new ClientProtocolException("Unexpected response status: " + status);




                    }
                }

            };
            String responseBody = httpclient.execute(httpget, responseHandler);
            System.out.println("----------------------------------------");
            System.out.println(responseBody);
            return responseBody;
        } finally {
            httpclient.close();
        }

    }
    public String postDist() throws IOException {
        CloseableHttpClient httpclient = HttpClients.createDefault();
        HttpGet httpget = new HttpGet("http://localhost:3000/isCorrectImage");// point to video analyzer server

        //Execute and get the response.
        CloseableHttpResponse response = httpclient.execute(httpget);


        HttpEntity entity = response.getEntity();

        if (entity != null) {
            try (InputStream instream = entity.getContent()) {
                String zeresponse = instream.toString();
                return zeresponse;
            }
        }


        return null;
    }
}
