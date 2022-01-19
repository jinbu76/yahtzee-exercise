namespace pcloud_tools.Utilities;

public class ConsoleInputOutput
{
    public static void OutputMainHelp()
    {
        // TODO: Versionsnummer laden
        Console.WriteLine("pcloud-uploader 0.1 (c) 2022 by Jinbu76");
        Console.WriteLine("usage: pcloud-uploader [command] [options]");
        Console.WriteLine("commands");
        Console.WriteLine("\tlogin username password\tLogin into pcloud");
        Console.WriteLine("\tupload filename.ext\t\tUpload file filename.ext");
    }

    public static (string, string) ReadCredential(string? username = null)
    {
        if (String.IsNullOrEmpty(username))
        {
            Console.Write("Username: ");
            username = Console.ReadLine() ?? String.Empty;
        }
        Console.Write("Password: ");
        var password = Console.ReadLine() ?? String.Empty;

        return (username, password);
    }
}