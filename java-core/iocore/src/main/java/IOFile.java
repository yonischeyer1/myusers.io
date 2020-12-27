import com.google.gson.Gson;

import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.zip.GZIPInputStream;
import java.util.zip.GZIPOutputStream;

public class IOFile {
    private ArrayList<IOAction> ioActions;
    private ScreenSettings screenSettings;
    private UserSettings userSettings;
    public IOFile() {
        ioActions = new ArrayList<IOAction>();
    }
    public void addIOAction(IOAction ioAction) {
        this.ioActions.add(ioAction);
    }

    public void setScreenSettings(ScreenSettings screenSettings) {
        this.screenSettings = screenSettings;
    }

    public void setUserSettings(UserSettings userSettings) { this.userSettings = userSettings; }


    public ScreenSettings getScreenSettings() {
        return screenSettings;
    }

    public UserSettings getUserSettings() {
        return userSettings;
    }

    public ArrayList<IOAction> getIoActions() {
        return ioActions;
    }

    public String searlizeToJson() throws IOException {
        Gson gson = new Gson();
        String json = gson.toJson(this.ioActions);
        return json;
    }


    private static void decompressGzipFile(String gzipFile, String newFile) {
        try {
            FileInputStream fis = new FileInputStream(gzipFile);
            GZIPInputStream gis = new GZIPInputStream(fis);
            FileOutputStream fos = new FileOutputStream(newFile);
            byte[] buffer = new byte[1024];
            int len;
            while((len = gis.read(buffer)) != -1){
                fos.write(buffer, 0, len);
            }
            //close resources
            fos.close();
            gis.close();
        } catch (IOException e) {
            e.printStackTrace();
        }

    }

    private static void compressGzipFile(String file, String gzipFile) {
        try {
            FileInputStream fis = new FileInputStream(file);
            FileOutputStream fos = new FileOutputStream(gzipFile);
            GZIPOutputStream gzipOS = new GZIPOutputStream(fos);
            byte[] buffer = new byte[1024];
            int len;
            while((len=fis.read(buffer)) != -1){
                gzipOS.write(buffer, 0, len);
            }
            //close resources
            gzipOS.close();
            fos.close();
            fis.close();
        } catch (IOException e) {
            e.printStackTrace();
        }

    }

}




