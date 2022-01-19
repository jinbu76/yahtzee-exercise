using pcloud_tools.Utilities;

var cmdLineArgs = Environment.GetCommandLineArgs();
if (cmdLineArgs.Length == 1)
{
    ConsoleInputOutput.OutputMainHelp();
    return -1;
}

var command = cmdLineArgs[1];
string username = String.Empty;
string password = String.Empty;

switch (command)
{
    case "login":
        try
        {
            username = cmdLineArgs[2];
            password = cmdLineArgs[3];
        }
        catch (IndexOutOfRangeException indexOutOfRangeException)
        {
            (username, password) = ConsoleInputOutput.ReadCredential(username);
        }
        
        break;
    case "upload":
        break;
    default:
        ConsoleInputOutput.OutputMainHelp();
        return -2;
}

return 0;