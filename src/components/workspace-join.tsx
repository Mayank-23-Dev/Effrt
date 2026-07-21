import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs'
import { dbService, Workspace, Member } from '../services/db'
import { ShieldCheck, UserPlus, Flame } from 'lucide-react'

interface WorkspaceJoinProps {
  onJoin: (workspace: Workspace, member: Member) => void
}

export default function WorkspaceJoin({ onJoin }: WorkspaceJoinProps) {
  // Join State
  const [inviteCode, setInviteCode] = useState('')
  const [userName, setUserName] = useState('')
  const [joinError, setJoinError] = useState('')
  const [isJoining, setIsJoining] = useState(false)

  // Create State
  const [workspaceName, setWorkspaceName] = useState('')
  const [creatorName, setCreatorName] = useState('')
  const [createError, setCreateError] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteCode || !userName) {
      setJoinError('Please fill in all fields.')
      return
    }

    setJoinError('')
    setIsJoining(true)

    try {
      const code = inviteCode.toUpperCase().trim()
      const workspace = await dbService.getWorkspaceByCode(code)
      if (!workspace) {
        setJoinError('Invalid invite code. Try "EFFRT-DEMO".')
        setIsJoining(false)
        return
      }

      // Check if member already exists in this workspace (simulated search)
      const members = await dbService.getMembers(workspace.id)
      const existingMember = members.find(m => m.name.toLowerCase().trim() === userName.toLowerCase().trim())
      
      let member: Member
      if (existingMember) {
        member = existingMember
      } else {
        member = await dbService.addMember(workspace.id, userName.trim())
      }

      onJoin(workspace, member)
    } catch (err: any) {
      setJoinError(err.message || 'An error occurred while joining.')
    } finally {
      setIsJoining(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!workspaceName || !creatorName) {
      setCreateError('Please fill in all fields.')
      return
    }

    setCreateError('')
    setIsCreating(true)

    try {
      // Generate unique invite code like EFFRT-XXXX
      const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase()
      const inviteCode = `EFFRT-${randomSuffix}`

      const workspace = await dbService.createWorkspace(workspaceName.trim(), inviteCode)
      const member = await dbService.addMember(workspace.id, creatorName.trim())

      onJoin(workspace, member)
    } catch (err: any) {
      setCreateError(err.message || 'An error occurred while creating.')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-4 animate-in fade-in slide-in-from-bottom-8 duration-500">
      {/* Brand Header */}
      <div className="text-center mb-8 flex flex-col items-center">
        <div className="flex items-center gap-2 mb-2">
          <Flame className="size-10 text-violet-500 animate-pulse" />
          <h1 className="text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400">
            EFFRT
          </h1>
        </div>
        <p className="text-zinc-400 text-lg italic tracking-wide">
          "Effort isn't a feeling. It's proof."
        </p>
      </div>

      <Card className="w-full max-w-md bg-zinc-900/60 border-zinc-800 backdrop-blur-md shadow-2xl">
        <CardContent className="pt-6">
          <Tabs defaultValue="join" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-zinc-950 p-1 border border-zinc-800 rounded-lg mb-6">
              <TabsTrigger 
                value="join" 
                className="rounded-md py-2 text-sm font-semibold transition-all data-[state=active]:bg-zinc-800 data-[state=active]:text-white data-[state=active]:shadow-sm"
              >
                Join Team
              </TabsTrigger>
              <TabsTrigger 
                value="create"
                className="rounded-md py-2 text-sm font-semibold transition-all data-[state=active]:bg-zinc-800 data-[state=active]:text-white data-[state=active]:shadow-sm"
              >
                New Workspace
              </TabsTrigger>
            </TabsList>

            {/* TAB: JOIN WORKSPACE */}
            <TabsContent value="join" className="animate-in fade-in slide-in-from-left-4 duration-300">
              <form onSubmit={handleJoin} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="inviteCode" className="text-zinc-300 text-sm font-semibold">
                    Invite Code
                  </Label>
                  <Input
                    id="inviteCode"
                    placeholder="e.g. EFFRT-DEMO"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    className="bg-zinc-950 border-zinc-800 text-white placeholder-zinc-600 focus-visible:ring-violet-500"
                    disabled={isJoining}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="userName" className="text-zinc-300 text-sm font-semibold">
                    Your Name
                  </Label>
                  <Input
                    id="userName"
                    placeholder="What should the team call you?"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="bg-zinc-950 border-zinc-800 text-white placeholder-zinc-600 focus-visible:ring-violet-500"
                    disabled={isJoining}
                  />
                </div>

                {joinError && (
                  <div className="text-red-400 bg-red-950/30 border border-red-900/50 rounded-lg p-3 text-sm flex items-center gap-2">
                    <span className="font-bold">⚠️</span> {joinError}
                  </div>
                )}

                <Button 
                  type="submit" 
                  disabled={isJoining}
                  className="w-full mt-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold py-2 rounded-lg transition-all shadow-lg hover:shadow-violet-500/20 active:scale-[0.98]"
                >
                  {isJoining ? 'Verifying Invite...' : 'Join Workspace'}
                </Button>
              </form>
            </TabsContent>

            {/* TAB: CREATE WORKSPACE */}
            <TabsContent value="create" className="animate-in fade-in slide-in-from-right-4 duration-300">
              <form onSubmit={handleCreate} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="workspaceName" className="text-zinc-300 text-sm font-semibold">
                    Project / Workspace Name
                  </Label>
                  <Input
                    id="workspaceName"
                    placeholder="e.g. CS 4820 Final Project"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    className="bg-zinc-950 border-zinc-800 text-white placeholder-zinc-600 focus-visible:ring-violet-500"
                    disabled={isCreating}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="creatorName" className="text-zinc-300 text-sm font-semibold">
                    Your Name (Workspace Admin)
                  </Label>
                  <Input
                    id="creatorName"
                    placeholder="Enter your name"
                    value={creatorName}
                    onChange={(e) => setCreatorName(e.target.value)}
                    className="bg-zinc-950 border-zinc-800 text-white placeholder-zinc-600 focus-visible:ring-violet-500"
                    disabled={isCreating}
                  />
                </div>

                {createError && (
                  <div className="text-red-400 bg-red-950/30 border border-red-900/50 rounded-lg p-3 text-sm flex items-center gap-2">
                    <span className="font-bold">⚠️</span> {createError}
                  </div>
                )}

                <Button 
                  type="submit" 
                  disabled={isCreating}
                  className="w-full mt-2 bg-gradient-to-r from-fuchsia-600 to-cyan-600 hover:from-fuchsia-500 hover:to-cyan-500 text-white font-semibold py-2 rounded-lg transition-all shadow-lg hover:shadow-cyan-500/20 active:scale-[0.98]"
                >
                  {isCreating ? 'Creating Workspace...' : 'Create Workspace'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-zinc-800/50 pt-4 text-xs text-zinc-500 gap-1.5">
          <ShieldCheck className="size-4 text-violet-400" />
          <span>Contributions are unforgeable and timestamped</span>
        </CardFooter>
      </Card>
    </div>
  )
}
