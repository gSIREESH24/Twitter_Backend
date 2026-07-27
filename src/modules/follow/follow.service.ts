import { AppError } from "../../common/errors/app-error";
import { FollowRepository } from "./follow.repository";

export class FollowService {
  constructor(
    private readonly followRepository =
      new FollowRepository()
  ) {}

  async followUser(
    followerId: string,
    followingId: string
  ) {
    // Cannot follow yourself
    if (followerId === followingId) {
      throw new AppError(
        400,
        "You cannot follow yourself"
      );
    }

    // Target user must exist
    const user =
      await this.followRepository.findUserById(
        followingId
      );

    if (!user) {
      throw new AppError(
        404,
        "User not found"
      );
    }

    // Already following?
    const alreadyFollowing =
      await this.followRepository.isFollowing(
        followerId,
        followingId
      );

    if (alreadyFollowing) {
      throw new AppError(
        409,
        "Already following this user"
      );
    }

    await this.followRepository.create(
      followerId,
      followingId
    );
  }

  async unfollowUser(
    followerId: string,
    followingId: string
    ) {
    if (followerId === followingId) {
        throw new AppError(
        400,
        "You cannot unfollow yourself"
        );
    }

    const user =
        await this.followRepository.findUserById(
        followingId
        );

    if (!user) {
        throw new AppError(
        404,
        "User not found"
        );
    }

    const follow =
        await this.followRepository.isFollowing(
        followerId,
        followingId
        );

    if (!follow) {
        throw new AppError(
        404,
        "You are not following this user"
        );
    }

    await this.followRepository.delete(
        followerId,
        followingId
    );
    }

    async getFollowers(
        userId: string,
        page: number,
        limit: number
        ) {
        const followers =
            await this.followRepository.getFollowers(
            userId,
            page,
            limit
            );

        return followers.map(
            (item) => item.follower
        );
        }
        

    async getFollowing(
        userId: string,
        page: number,
        limit: number
        ) {
        const following =
            await this.followRepository.getFollowing(
            userId,
            page,
            limit
            );

        return following.map(
            (item) => item.following
        );
        }


    async getFollowStats(userId: string) {
        return this.followRepository.getFollowStats(userId);
    }

    async checkIsFollowing(
        followerId: string,
        followingId: string
        ) {
        if (followerId === followingId) {
            return {
            isFollowing: false,
            };
        }

        const follow =
            await this.followRepository.isFollowing(
            followerId,
            followingId
            );

        return {
            isFollowing: !!follow,
        };
        }
}