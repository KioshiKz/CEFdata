Option Explicit

Dim shell, fso, rootDir, runtimeDir, logFile, errFile, runnerFile, url, healthUrl, cmdPath, nodePath
Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

rootDir = fso.GetParentFolderName(WScript.ScriptFullName)
runtimeDir = fso.BuildPath(rootDir, ".site-runtime")
logFile = fso.BuildPath(runtimeDir, "server.log")
errFile = fso.BuildPath(runtimeDir, "server.err")
runnerFile = fso.BuildPath(runtimeDir, "run-server.cmd")
url = "http://127.0.0.1:3000/"
healthUrl = url & "api/health"
cmdPath = shell.ExpandEnvironmentStrings("%ComSpec%")
If cmdPath = "%ComSpec%" Or Not fso.FileExists(cmdPath) Then
    cmdPath = "C:\Windows\System32\cmd.exe"
End If

If Not fso.FolderExists(runtimeDir) Then
    fso.CreateFolder(runtimeDir)
End If

shell.CurrentDirectory = rootDir
nodePath = FindNodePath()

If nodePath = "" Then
    MsgBox "Node.js was not found. Install Node.js, then run this file again.", vbCritical, "Site launcher"
    WScript.Quit 1
End If

If Not IsServerReady(healthUrl) Then
    WriteRunnerFile nodePath
    shell.Run """" & cmdPath & """ /c """ & runnerFile & """", 0, False
End If

If WaitForServer(healthUrl, 20) Then
    shell.Run url, 1, False
Else
    MsgBox "The server did not start. Check this file: " & errFile, vbCritical, "Site launcher"
    WScript.Quit 1
End If

Function WaitForServer(checkUrl, seconds)
    Dim i
    For i = 1 To seconds * 2
        If IsServerReady(checkUrl) Then
            WaitForServer = True
            Exit Function
        End If
        WScript.Sleep 500
    Next
    WaitForServer = False
End Function

Function FindNodePath()
    Dim programFilesPath, localNodePath
    programFilesPath = shell.ExpandEnvironmentStrings("%ProgramFiles%") & "\nodejs\node.exe"
    localNodePath = shell.ExpandEnvironmentStrings("%LOCALAPPDATA%") & "\Programs\nodejs\node.exe"

    If fso.FileExists(programFilesPath) Then
        FindNodePath = programFilesPath
        Exit Function
    End If

    If fso.FileExists(localNodePath) Then
        FindNodePath = localNodePath
        Exit Function
    End If

    If shell.Run("""" & cmdPath & """ /c node --version >nul 2>nul", 0, True) = 0 Then
        FindNodePath = "node"
        Exit Function
    End If

    FindNodePath = ""
End Function

Sub WriteRunnerFile(nodeExe)
    Dim file
    Set file = fso.CreateTextFile(runnerFile, True)
    file.WriteLine "@echo off"
    file.WriteLine "cd /d """ & rootDir & """"
    If nodeExe = "node" Then
        file.WriteLine "node ""server.js"" 1>""" & logFile & """ 2>""" & errFile & """"
    Else
        file.WriteLine """" & nodeExe & """ ""server.js"" 1>""" & logFile & """ 2>""" & errFile & """"
    End If
    file.Close
End Sub

Function IsServerReady(checkUrl)
    On Error Resume Next
    Dim request
    Set request = CreateObject("MSXML2.ServerXMLHTTP.6.0")
    request.Open "GET", checkUrl, False
    request.setTimeouts 1000, 1000, 1000, 1000
    request.Send
    IsServerReady = (Err.Number = 0 And request.Status = 200)
    Err.Clear
    On Error GoTo 0
End Function
